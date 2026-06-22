/// <reference path="../pb_data/types.d.ts" />

// marciocanever@hotmail.com já é admin no frontend e no hook de listagem de
// usuários, mas as regras das coleções clínicas só liberavam admin@canever.com.br.
// Esta migration concede a esse e-mail os mesmos poderes de admin sobre
// fotos_paciente, exames_pdf e bioimpedancia_pdf (incl. acesso aos arquivos).
migrate(
  (app) => {
    const ADMIN =
      "@request.auth.email = 'admin@canever.com.br' || @request.auth.email = 'marciocanever@hotmail.com'"
    const regra = `usuario_id = @request.auth.id || ${ADMIN}`

    for (const nome of ['fotos_paciente', 'exames_pdf', 'bioimpedancia_pdf']) {
      const col = app.findCollectionByNameOrId(nome)
      col.listRule = regra
      col.viewRule = regra
      col.createRule = regra
      col.updateRule = regra
      col.deleteRule = regra
      app.save(col)
    }
  },
  (app) => {
    const regra =
      "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'"
    for (const nome of ['fotos_paciente', 'exames_pdf', 'bioimpedancia_pdf']) {
      const col = app.findCollectionByNameOrId(nome)
      col.listRule = regra
      col.viewRule = regra
      col.createRule = regra
      col.updateRule = regra
      col.deleteRule = regra
      app.save(col)
    }
  },
)
