/**
 * ============================================================================
 * GOOGLE APPS SCRIPT PARA SINCRONIZAÇÃO COM VERIFICADOR DE PATRIMÔNIO
 * ============================================================================
 * 
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 
 * 1. Abra sua planilha do Google Sheets
 * 2. Clique em: Extensões → Apps Script
 * 3. Apague todo o código padrão
 * 4. Cole este código completo
 * 5. Clique em "Implantar" → "Nova implantação"
 * 6. Tipo: "Aplicativo da Web"
 * 7. Executar como: "Eu (seu@email.com)"
 * 8. Quem tem acesso: "Qualquer pessoa" (necessário para o app enviar dados)
 * 9. Clique em "Implantar"
 * 10. Copie a URL do Web App (ex: https://script.google.com/macros/s/.../exec)
 * 11. Cole essa URL no campo "URL do Apps Script" no app
 * 
 * ATENÇÃO: Você precisará autorizar o script na primeira execução!
 * 
 * ============================================================================
 */

// Nome da aba onde os resultados serão gravados
const RESULTS_SHEET_NAME = 'Verificações';

/**
 * Manipula requisições POST do app
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'updateResults') {
      return handleUpdateResults(data.results);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Ação desconhecida' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Permite requisições GET (para testes)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: 'Apps Script do Verificador de Patrimônio está funcionando!',
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Atualiza a planilha com os resultados das verificações
 */
function handleUpdateResults(results) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(RESULTS_SHEET_NAME);
  
  // Criar aba se não existir
  if (!sheet) {
    sheet = ss.insertSheet(RESULTS_SHEET_NAME);
    
    // Adicionar cabeçalhos
    const headers = [
      'ID',
      'Data/Hora',
      'Número OCR',
      'QR Code Completo',
      'QR Números',
      'Comparação',
      'Status',
      'Info do Ativo',
      'Sincronizado em'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // Formatar cabeçalho
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4a86e8')
      .setFontColor('#ffffff');
  }
  
  // Preparar dados para inserção
  const now = new Date().toLocaleString('pt-BR');
  const rows = results.map(r => [
    r.id,
    r.timestamp,
    r.ocr_number || '',
    r.qr_raw || '',
    r.qr_digits || '',
    r.compare || '',
    r.status || '',
    r.asset_info || '',
    now
  ]);
  
  // Verificar se já existem IDs duplicados
  const lastRow = sheet.getLastRow();
  const existingIds = new Set();
  
  if (lastRow > 1) {
    const existingData = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    existingData.forEach(row => existingIds.add(row[0]));
  }
  
  // Filtrar apenas novos registros
  const newRows = rows.filter(row => !existingIds.has(row[0]));
  
  if (newRows.length > 0) {
    // Adicionar novos dados
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    
    // Aplicar formatação condicional por status
    const statusRange = sheet.getRange(startRow, 7, newRows.length, 1);
    const statusValues = statusRange.getValues();
    
    for (let i = 0; i < statusValues.length; i++) {
      const cell = sheet.getRange(startRow + i, 7);
      const status = statusValues[i][0];
      
      if (status === 'OK') {
        cell.setBackground('#d9ead3').setFontColor('#38761d');
      } else if (status === 'Erro') {
        cell.setBackground('#f4cccc').setFontColor('#990000');
      } else if (status === 'Aviso') {
        cell.setBackground('#fff2cc').setFontColor('#bf9000');
      }
    }
    
    // Auto-ajustar largura das colunas
    sheet.autoResizeColumns(1, 9);
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: `${newRows.length} novos registros adicionados`,
      total: results.length,
      new: newRows.length,
      duplicates: results.length - newRows.length
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Função auxiliar para buscar patrimônio na planilha original
 * (opcional - pode ser expandida conforme necessário)
 */
function findAssetByPatrimonio(numero) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  for (const sheet of sheets) {
    if (sheet.getName() === RESULTS_SHEET_NAME) continue;
    
    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (String(data[i][j]).includes(numero)) {
          return {
            row: i + 1,
            col: j + 1,
            sheet: sheet.getName(),
            data: data[i]
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Cria menu customizado (opcional)
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 Verificador de Patrimônio')
    .addItem('📊 Ver Estatísticas', 'showStats')
    .addItem('🔄 Atualizar Formatação', 'updateFormatting')
    .addItem('ℹ️ Sobre', 'showAbout')
    .addToUi();
}

/**
 * Mostra estatísticas das verificações
 */
function showStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(RESULTS_SHEET_NAME);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Nenhuma verificação encontrada!');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('Nenhum dado encontrado!');
    return;
  }
  
  const statusData = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
  
  let ok = 0, erro = 0, aviso = 0;
  statusData.forEach(row => {
    if (row[0] === 'OK') ok++;
    else if (row[0] === 'Erro') erro++;
    else if (row[0] === 'Aviso') aviso++;
  });
  
  const total = ok + erro + aviso;
  const message = `
📊 ESTATÍSTICAS DE VERIFICAÇÃO

Total de verificações: ${total}

✅ OK: ${ok} (${((ok/total)*100).toFixed(1)}%)
❌ Erros: ${erro} (${((erro/total)*100).toFixed(1)}%)
⚠️ Avisos: ${aviso} (${((aviso/total)*100).toFixed(1)}%)

Última sincronização: ${new Date().toLocaleString('pt-BR')}
  `;
  
  SpreadsheetApp.getUi().alert(message);
}

/**
 * Atualiza formatação da planilha
 */
function updateFormatting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(RESULTS_SHEET_NAME);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Aba de verificações não encontrada!');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Aplicar formatação condicional
  const statusRange = sheet.getRange(2, 7, lastRow - 1, 1);
  const statusValues = statusRange.getValues();
  
  for (let i = 0; i < statusValues.length; i++) {
    const cell = sheet.getRange(2 + i, 7);
    const status = statusValues[i][0];
    
    if (status === 'OK') {
      cell.setBackground('#d9ead3').setFontColor('#38761d');
    } else if (status === 'Erro') {
      cell.setBackground('#f4cccc').setFontColor('#990000');
    } else if (status === 'Aviso') {
      cell.setBackground('#fff2cc').setFontColor('#bf9000');
    }
  }
  
  SpreadsheetApp.getUi().alert('Formatação atualizada!');
}

/**
 * Mostra informações sobre o script
 */
function showAbout() {
  const message = `
📋 Verificador de Patrimônio
Versão 1.0

Este Apps Script permite sincronizar automaticamente
as verificações feitas no app mobile com esta planilha.

Desenvolvido para facilitar a verificação de ativos
e etiquetas de patrimônio com QR codes.

© 2025
  `;
  
  SpreadsheetApp.getUi().alert(message);
}
