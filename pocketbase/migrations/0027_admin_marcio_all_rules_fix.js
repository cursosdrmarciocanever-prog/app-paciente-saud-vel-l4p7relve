/// <reference path="../pb_data/types.d.ts" />

// 0026 nao funcionou (leitura de regra no JSVM nao retorna string pura).
// Esta migration ATRIBUI os valores finais (admin@canever + marciocanever)
// para todas as regras admin restantes.
migrate(
  (app) => {
    {
      const col = app.findCollectionByNameOrId("categorias_conteudo")
      col.createRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("artigos")
      col.listRule = "(@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')) || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')) || @request.auth.email = 'marciocanever@hotmail.com'"
      col.createRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("videos")
      col.listRule = "(@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')) || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')) || @request.auth.email = 'marciocanever@hotmail.com'"
      col.createRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("injetaveis")
      col.createRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("pedidos_injetaveis")
      col.listRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.createRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("catalogo_injetaveis")
      col.createRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("conversas_suporte")
      col.listRule = "(@request.auth.id = usuario_id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(@request.auth.id = usuario_id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.id = usuario_id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("mensagens_suporte")
      col.listRule = "(conversa_id.usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(conversa_id.usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("atividades_fisicas")
      col.listRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.createRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("badges")
      col.createRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("user_badges")
      col.listRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.createRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(@request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("hidratacao")
      col.listRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.createRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
    {
      const col = app.findCollectionByNameOrId("refeicoes")
      col.listRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.viewRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.createRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.updateRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      col.deleteRule = "(usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br') || @request.auth.email = 'marciocanever@hotmail.com'"
      app.save(col)
    }
  },
  (app) => {
    // down: nao reverte (mantem marcio como admin)
  },
)
