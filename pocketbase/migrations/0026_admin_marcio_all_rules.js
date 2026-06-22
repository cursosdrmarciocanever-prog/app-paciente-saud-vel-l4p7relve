/// <reference path="../pb_data/types.d.ts" />

// Concede a marciocanever@hotmail.com os mesmos poderes de admin que
// admin@canever.com.br em TODAS as coleções: para cada regra que referencia o
// e-mail de admin, envolve a regra existente e adiciona o segundo e-mail.
// (fotos_paciente/exames_pdf/bioimpedancia_pdf já foram tratados na 0025.)
const COLS_0026 = [
  'categorias_conteudo',
  'artigos',
  'videos',
  'injetaveis',
  'pedidos_injetaveis',
  'catalogo_injetaveis',
  'conversas_suporte',
  'mensagens_suporte',
  'atividades_fisicas',
  'badges',
  'user_badges',
  'hidratacao',
  'refeicoes',
]
const RULE_KEYS_0026 = ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule']
const MARCIO_0026 = "@request.auth.email = 'marciocanever@hotmail.com'"

migrate(
  (app) => {
    for (const nome of COLS_0026) {
      let col
      try {
        col = app.findCollectionByNameOrId(nome)
      } catch (e) {
        continue
      }
      let mudou = false
      for (const key of RULE_KEYS_0026) {
        const r = col[key]
        if (
          r &&
          typeof r === 'string' &&
          r.indexOf('admin@canever.com.br') !== -1 &&
          r.indexOf('marciocanever@hotmail.com') === -1
        ) {
          col[key] = '(' + r + ') || ' + MARCIO_0026
          mudou = true
        }
      }
      if (mudou) app.save(col)
    }
  },
  (app) => {
    const sufixo = ') || ' + MARCIO_0026
    for (const nome of COLS_0026) {
      let col
      try {
        col = app.findCollectionByNameOrId(nome)
      } catch (e) {
        continue
      }
      let mudou = false
      for (const key of RULE_KEYS_0026) {
        const r = col[key]
        if (r && typeof r === 'string' && r.indexOf(sufixo) !== -1 && r.charAt(0) === '(') {
          col[key] = r.substring(1, r.length - sufixo.length)
          mudou = true
        }
      }
      if (mudou) app.save(col)
    }
  },
)
