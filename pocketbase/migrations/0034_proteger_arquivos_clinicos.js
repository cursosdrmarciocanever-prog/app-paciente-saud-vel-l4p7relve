/// <reference path="../pb_data/types.d.ts" />

// LGPD: marca os arquivos clínicos como PROTEGIDOS (exigem token de acesso),
// para que não fiquem públicos por URL. Imagens de produto (injetaveis) seguem
// públicas de propósito.
const ALVOS_0034 = [
  ['fotos_paciente', 'foto'],
  ['exames_pdf', 'arquivo'],
  ['bioimpedancia_pdf', 'arquivo'],
]

migrate(
  (app) => {
    for (const [colNome, campo] of ALVOS_0034) {
      const col = app.findCollectionByNameOrId(colNome)
      const f = col.fields.getByName(campo)
      if (f) {
        f.protected = true
        app.save(col)
      }
    }
  },
  (app) => {
    for (const [colNome, campo] of ALVOS_0034) {
      const col = app.findCollectionByNameOrId(colNome)
      const f = col.fields.getByName(campo)
      if (f) {
        f.protected = false
        app.save(col)
      }
    }
  },
)
