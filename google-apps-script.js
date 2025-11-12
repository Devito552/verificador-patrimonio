/**
 * ============================================================================
 * GOOGLE APPS SCRIPT PARA ATUALIZAR PLANILHA DE PATRIMÔNIO
 * ============================================================================
 * 
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 
 * 1. Abra sua planilha do Google Sheets (a que tem os ativos)
 * 2. Clique em: Extensões → Apps Script
 * 3. Apague todo o código padrão
 * 4. Cole este código completo
 * 5. CONFIGURE O NOME DA ABA abaixo (linha 25)
 * 6. CONFIGURE OS NOMES DAS COLUNAS abaixo (linhas 26-28)
 * 7. Clique em "Implantar" → "Nova implantação"
 * 8. Tipo: "Aplicativo da Web"
 * 9. Executar como: "Eu (seu@email.com)"
 * 10. Quem tem acesso: "Qualquer pessoa"
 * 11. Clique em "Implantar"
 * 12. Copie a URL do Web App
 * 13. Cole no app web no campo "URL do Apps Script"
 * 
 * ============================================================================
 */

// ============ CONFIGURAÇÃO - EDITE AQUI ============
const SHEET_NAME = 'Planilha1'; // Nome da aba com os ativos
const COL_ATIVO = 'Ativo'; // Nome da coluna com o número do patrimônio
const COL_SITUACAO = 'SITUAÇÃO ATUAL'; // Nome da coluna SITUAÇÃO ATUAL
const COL_PLAQUETA = 'PLAQUETA QR-CODE'; // Nome da coluna PLAQUETA QR-CODE
// ==================================================

/**
 * Manipula requisições POST do app
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'updateAsset') {
      return handleUpdateAsset(data);
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
 * Atualiza as colunas SITUAÇÃO ATUAL e PLAQUETA QR-CODE na planilha
 */
function handleUpdateAsset(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: `Aba "${SHEET_NAME}" não encontrada! Configure o nome correto no Apps Script.`
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const ativo = data.ativo; // Número do patrimônio
  const situacaoAtual = data.situacao_atual; // OK ou NÃO ENCONTRADO
  const plaquetaQrCode = data.plaqueta_qr_code; // OK ou ERRO
  
  if (!ativo) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Número do ativo não fornecido' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Obter todos os dados da planilha
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  
  // Encontrar índices das colunas
  const colAtivoIndex = headers.indexOf(COL_ATIVO);
  const colSituacaoIndex = headers.indexOf(COL_SITUACAO);
  const colPlaquetaIndex = headers.indexOf(COL_PLAQUETA);
  
  if (colAtivoIndex === -1) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: `Coluna "${COL_ATIVO}" não encontrada! Verifique o nome no Apps Script.`
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Se colunas não existem, criar
  let needsSituacao = colSituacaoIndex === -1;
  let needsPlaqueta = colPlaquetaIndex === -1;
  
  let situacaoCol = colSituacaoIndex;
  let plaquetaCol = colPlaquetaIndex;
  
  if (needsSituacao) {
    situacaoCol = headers.length;
    sheet.getRange(1, situacaoCol + 1).setValue(COL_SITUACAO);
  }
  
  if (needsPlaqueta) {
    plaquetaCol = needsSituacao ? headers.length + 1 : headers.length;
    sheet.getRange(1, plaquetaCol + 1).setValue(COL_PLAQUETA);
  }
  
  // Procurar linha do ativo (apenas os dígitos)
  const ativoDigitos = String(ativo).replace(/\D/g, '');
  let rowIndex = -1;
  
  for (let i = 1; i < values.length; i++) {
    const cellValue = String(values[i][colAtivoIndex]).replace(/\D/g, '');
    if (cellValue === ativoDigitos) {
      rowIndex = i + 1; // +1 porque arrays começam em 0
      break;
    }
  }
  
  if (rowIndex === -1) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: `Ativo ${ativo} não encontrado na planilha`
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Atualizar as células
  if (situacaoAtual) {
    sheet.getRange(rowIndex, situacaoCol + 1).setValue(situacaoAtual);
  }
  
  if (plaquetaQrCode) {
    sheet.getRange(rowIndex, plaquetaCol + 1).setValue(plaquetaQrCode);
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: `Ativo ${ativo} atualizado com sucesso!`,
      row: rowIndex,
      situacao: situacaoAtual,
      plaqueta: plaquetaQrCode
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Cria menu customizado (opcional)
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 Verificador de Patrimônio')
    .addItem('ℹ️ Sobre', 'showAbout')
    .addToUi();
}

/**
 * Mostra informações sobre o script
 */
function showAbout() {
  const message = `
📋 Verificador de Patrimônio - Apps Script
Versão 2.0

Este script atualiza automaticamente as colunas:
• SITUAÇÃO ATUAL (OK / NÃO ENCONTRADO)
• PLAQUETA QR-CODE (OK / ERRO)

Quando você escaneia um ativo no app mobile.

CONFIGURAÇÃO:
- Nome da aba: ${SHEET_NAME}
- Coluna Ativo: ${COL_ATIVO}
- Coluna Situação: ${COL_SITUACAO}
- Coluna Plaqueta: ${COL_PLAQUETA}

Se precisar mudar, edite as linhas 24-27 do Apps Script.

© 2025
  `;
  
  SpreadsheetApp.getUi().alert(message);
}
