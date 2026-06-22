/// <reference path="../pb_data/types.d.ts" />

// O campo de texto `conteudo` tinha limite de 5000 caracteres (default do
// PocketBase), o que truncava/rejeitava planos alimentares completos do
// assistente (~8-12k chars). Aumenta para 50000 em mensagens_suporte e dietas.
migrate(
  (app) => {
    for (const nome of ['mensagens_suporte', 'dietas']) {
      const col = app.findCollectionByNameOrId(nome)
      const field = col.fields.getByName('conteudo')
      field.max = 50000
      app.save(col)
    }
  },
  (app) => {
    for (const nome of ['mensagens_suporte', 'dietas']) {
      const col = app.findCollectionByNameOrId(nome)
      const field = col.fields.getByName('conteudo')
      field.max = 5000
      app.save(col)
    }
  },
)
