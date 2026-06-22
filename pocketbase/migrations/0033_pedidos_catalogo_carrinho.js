/// <reference path="../pb_data/types.d.ts" />

// Evolui pedidos_catalogo para suportar CARRINHO (vários itens num pedido):
// adiciona campo `itens` (JSON em texto) e torna os campos de item único
// opcionais (catalogo_id, produto, quantidade).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pedidos_catalogo')

    if (!col.fields.getByName('itens')) {
      col.fields.add(new TextField({ name: 'itens', required: false }))
    }
    for (const nome of ['catalogo_id', 'produto', 'quantidade']) {
      const f = col.fields.getByName(nome)
      if (f) f.required = false
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('pedidos_catalogo')
    const f = col.fields.getByName('itens')
    if (f) col.fields.removeById(f.id)
    for (const nome of ['catalogo_id', 'produto', 'quantidade']) {
      const ff = col.fields.getByName(nome)
      if (ff) ff.required = true
    }
    app.save(col)
  },
)
