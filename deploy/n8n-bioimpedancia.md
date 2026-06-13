# n8n + WhatsApp (Evolution API) → Bioimpedância por CPF

Fluxo: o admin envia o **PDF da bioimpedância no WhatsApp** com o **CPF na legenda**
(opcionalmente a data). O n8n recebe, baixa o PDF (base64), e chama o endpoint do app,
que arquiva e vincula ao paciente por CPF (ou deixa pendente até ele se cadastrar).

```
WhatsApp (admin envia PDF + CPF na legenda)
   │  Evolution API  (webhook: messages.upsert)
   ▼
n8n: [Webhook] → [IF é PDF] → [Code: extrai CPF/data] → [HTTP: getBase64 da Evolution]
        → [HTTP: POST /backend/v1/bioimpedancia/anexar] → [HTTP: responde no WhatsApp]
   │
   ▼
App PocketBase: cria bioimpedancia_pdf (cpf + data + PDF) → hook vincula por CPF
```

## Protocolo de envio (combine com a clínica)

Enviar o **documento PDF** para o número do WhatsApp da automação, com a **legenda**:

- `12345678900`  → usa a data de hoje, OU
- `12345678900 10/06/2026`  → CPF e data da medição

O CPF pode ir com ou sem máscara (`123.456.789-00`).

## Endpoint do app (já está no ar)

```
POST https://app.clinicacanever.com.br/backend/v1/bioimpedancia/anexar
Header:  X-Intake-Token: <BIOIMPEDANCIA_INTAKE_TOKEN>
Body JSON:
{
  "cpf": "12345678900",
  "data_medicao": "2026-06-10",
  "arquivo_base64": "<base64 do PDF (sem o prefixo data:)>",
  "nome_arquivo": "bioimpedancia.pdf"
}
```
Resposta: `{ "success": true, "id": "...", "pendente": true|false, "usuario_id": "..." }`

> O token está no servidor em `/etc/systemd/system/canever-app.service.d/intake.conf`
> (variável `BIOIMPEDANCIA_INTAKE_TOKEN`).

## Configuração na Evolution API

No painel/instância da Evolution, configure o **Webhook** apontando para o n8n e
habilite o evento **MESSAGES_UPSERT**:

- URL do webhook: `https://SEU-N8N/webhook/bioimpedancia-whatsapp`
- Eventos: `MESSAGES_UPSERT`

Anote para usar no n8n:
- `EVOLUTION_URL`  — ex.: `https://evolution.seudominio.com`
- `EVOLUTION_INSTANCE` — nome da instância (ex.: `clinica`)
- `EVOLUTION_APIKEY` — apikey da instância

## Passo a passo no n8n

Importe o arquivo `deploy/n8n-bioimpedancia-workflow.json` (menu **⋯ → Import from File**)
ou monte os nós abaixo. Depois edite o nó **"Config"** com seus valores.

### 1) Webhook (gatilho)
- Tipo: **Webhook**
- HTTP Method: `POST`
- Path: `bioimpedancia-whatsapp`
- Respond: `Immediately`

### 2) Config (nó Set — preencha uma vez)
Campos (string):
- `evolutionUrl` = `https://evolution.seudominio.com`
- `instance` = `clinica`
- `evolutionApiKey` = `SUA_APIKEY`
- `appToken` = `<BIOIMPEDANCIA_INTAKE_TOKEN>`

### 3) IF — só PDF
Condição (TRUE para continuar):
- `{{ $json.body.data.message.documentMessage.mimetype }}` **contém** `pdf`

(opcional) ignorar mensagens próprias: `{{ $json.body.data.key.fromMe }}` é `false`.

### 4) Code — extrai CPF, data e dados da mensagem
```js
const data = $('Webhook').item.json.body.data;
const doc = data.message.documentMessage || {};
const legenda = doc.caption || '';
const digits = (legenda.match(/\d/g) || []).join('');
const cpf = digits.slice(0, 11);

// data dd/mm/aaaa na legenda; senão, hoje
let dataMedicao = new Date().toISOString().slice(0, 10);
const m = legenda.match(/(\d{2})\/(\d{2})\/(\d{4})/);
if (m) dataMedicao = `${m[3]}-${m[2]}-${m[1]}`;

return [{
  json: {
    cpf,
    dataMedicao,
    fileName: doc.fileName || 'bioimpedancia.pdf',
    remoteJid: data.key.remoteJid,
    evoMessage: data,            // mensagem completa p/ baixar a mídia
    cpfValido: cpf.length === 11,
  }
}];
```

### 5) HTTP Request — baixar o PDF (base64) da Evolution
- Method: `POST`
- URL: `={{ $('Config').item.json.evolutionUrl }}/chat/getBase64FromMediaMessage/{{ $('Config').item.json.instance }}`
- Headers: `apikey` = `={{ $('Config').item.json.evolutionApiKey }}`
- Body (JSON):
```json
{ "message": {{ JSON.stringify($('Code').item.json.evoMessage) }}, "convertToMp4": false }
```
Retorna um campo `base64` com o conteúdo do PDF.

### 6) HTTP Request — anexar no app
- Method: `POST`
- URL: `https://app.clinicacanever.com.br/backend/v1/bioimpedancia/anexar`
- Headers:
  - `X-Intake-Token` = `={{ $('Config').item.json.appToken }}`
  - `Content-Type` = `application/json`
- Body (JSON):
```json
{
  "cpf": "={{ $('Code').item.json.cpf }}",
  "data_medicao": "={{ $('Code').item.json.dataMedicao }}",
  "arquivo_base64": "={{ $json.base64 }}",
  "nome_arquivo": "={{ $('Code').item.json.fileName }}"
}
```

### 7) (opcional) HTTP Request — responder no WhatsApp
- Method: `POST`
- URL: `={{ $('Config').item.json.evolutionUrl }}/message/sendText/{{ $('Config').item.json.instance }}`
- Headers: `apikey` = `={{ $('Config').item.json.evolutionApiKey }}`
- Body (JSON):
```json
{
  "number": "={{ $('Code').item.json.remoteJid }}",
  "text": "={{ $json.pendente ? '✅ Bioimpedância arquivada (pendente — será vinculada quando o paciente se cadastrar com este CPF).' : '✅ Bioimpedância vinculada ao paciente com sucesso.' }}"
}
```

## Teste rápido (sem WhatsApp)

Você pode validar o endpoint direto (substitua o token e um base64 de PDF):
```bash
curl -X POST https://app.clinicacanever.com.br/backend/v1/bioimpedancia/anexar \
  -H "X-Intake-Token: <TOKEN>" -H "Content-Type: application/json" \
  -d '{"cpf":"12345678900","data_medicao":"2026-06-10","arquivo_base64":"<BASE64>","nome_arquivo":"teste.pdf"}'
```

## Dicas
- Se a Evolution enviar a legenda em `extendedTextMessage` separada do documento,
  prefira o protocolo "PDF com legenda" (um único envio).
- Para restringir quem pode enviar, adicione no IF uma checagem do `remoteJid`
  (somente números autorizados da clínica).
