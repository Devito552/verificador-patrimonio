# 📋 Verificador de Patrimônio

Aplicação web (PWA) para verificar itens de patrimônio usando câmera do celular. Detecta números via OCR e QR codes, compara automaticamente e exporta para Excel.

## 🎯 Funcionalidades

- ✅ **Leitura de QR Code**: Detecta QR codes automaticamente em tempo real
- ✅ **OCR (Reconhecimento de Texto)**: Extrai números impressos nas etiquetas
- ✅ **Comparação Automática**: Verifica se o número OCR e QR code coincidem
- ✅ **Alertas Visuais e Sonoros**: Feedback imediato para cada verificação
- ✅ **Exportação para Excel**: Salva todos os resultados em planilha
- ✅ **Funciona Offline**: Dados salvos localmente no dispositivo
- ✅ **Estatísticas em Tempo Real**: Acompanhe itens OK, com erro e avisos

## 📱 Como Usar

### 1. Abrir no Celular

**Opção A - Servidor Local (recomendado):**
```bash
# Com Python 3
python -m http.server 8000

# Ou com Node.js (se tiver npx instalado)
npx serve
```

Depois acesse no celular: `http://SEU-IP:8000`

**Opção B - Publicar Online:**
- Suba os arquivos para GitHub Pages, Vercel, Netlify, etc.
- Acesse a URL no celular

### 2. Instalar como App (PWA)

No celular, ao abrir a página:
- **Chrome/Edge**: Clique em "⋮" → "Adicionar à tela inicial"
- **Safari (iOS)**: Clique em "Compartilhar" → "Adicionar à Tela de Início"

### 3. Verificar Patrimônio

1. Clique em **"Iniciar Câmera"**
2. Aponte para a etiqueta de patrimônio
3. O app lerá automaticamente o QR code
4. Clique em **"Escanear Agora"** para extrair o número com OCR
5. Veja o resultado: ✓ OK (se iguais) ou ✗ ERRO (se diferentes)

### 4. Exportar Dados

- Clique em **"Baixar Excel"**
- Arquivo será salvo com todos os registros
- Formato: `patrimonio_YYYY-MM-DD.xlsx`

## 🔧 Configurações

### Modo Automático QR
Detecta QR codes continuamente (padrão: ativo)

### OCR Automático
Extrai número automaticamente após ler QR (desabilitado por padrão para economizar processamento)

### Alertas Sonoros
Bipes de feedback para cada operação

## 📊 Dados Exportados

O Excel contém as seguintes colunas:
- **ID**: Número sequencial
- **Data/Hora**: Timestamp da verificação
- **Número OCR**: Texto extraído da imagem
- **QR Code Completo**: Conteúdo bruto do QR
- **QR Números**: Apenas dígitos do QR
- **Comparação**: Resultado da verificação
- **Status**: OK / Erro / Aviso

## 🛠️ Tecnologias

- [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) - Leitura de QR codes
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR
- [SheetJS](https://sheetjs.com/) - Exportação Excel
- Service Worker - Funcionamento offline
- LocalStorage - Persistência de dados

## 📝 Dicas

- **Iluminação**: Garanta boa iluminação para melhor OCR
- **Distância**: Mantenha ~15-30cm da etiqueta
- **Foco**: Espere a câmera focar antes de escanear
- **Limpeza**: Use "Limpar Tudo" periodicamente após exportar

## 🔒 Privacidade

- Todos os dados ficam apenas no seu dispositivo
- Nada é enviado para servidores externos
- As bibliotecas são carregadas de CDNs públicos

## ⚠️ Problemas Conhecidos

### QR Code impresso errado
O app detecta isso! Se o QR tiver número diferente do impresso, mostrará como **ERRO** com detalhes da divergência.

### OCR não funciona bem
- Tente ajustar iluminação
- Aproxime ou afaste a câmera
- Use fonte grande e legível nas etiquetas

## 📄 Estrutura de Arquivos

```
patrimonio/
├── index.html      # Aplicação principal
├── manifest.json   # Configuração PWA
├── sw.js          # Service Worker (offline)
└── README.md      # Esta documentação
```

## 🚀 Próximas Melhorias

- [ ] Sincronização com Google Sheets
- [ ] Modo noturno
- [ ] Upload de planilha base para comparação
- [ ] Histórico com filtros e busca
- [ ] Suporte a múltiplos usuários

---

**Desenvolvido para verificação de patrimônio** 📦
