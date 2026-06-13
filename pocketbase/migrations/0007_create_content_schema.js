migrate(
  (app) => {
    // 1. Categories
    const categorias = new Collection({
      name: 'categorias_conteudo',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.email = 'admin@canever.com.br'",
      updateRule: "@request.auth.email = 'admin@canever.com.br'",
      deleteRule: "@request.auth.email = 'admin@canever.com.br'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'icone', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(categorias)

    // 2. Articles
    const artigos = new Collection({
      name: 'artigos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')",
      viewRule:
        "@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')",
      createRule: "@request.auth.email = 'admin@canever.com.br'",
      updateRule: "@request.auth.email = 'admin@canever.com.br'",
      deleteRule: "@request.auth.email = 'admin@canever.com.br'",
      fields: [
        { name: 'titulo', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: true },
        { name: 'conteudo', type: 'text', required: true },
        {
          name: 'categoria_id',
          type: 'relation',
          required: true,
          collectionId: categorias.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'autor', type: 'text' },
        { name: 'imagem_url', type: 'text' },
        { name: 'publicado', type: 'bool' },
        { name: 'data_publicacao', type: 'date' },
        { name: 'visualizacoes', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_artigos_cat_pub ON artigos (categoria_id, publicado)',
        'CREATE INDEX idx_artigos_created ON artigos (created)',
      ],
    })
    app.save(artigos)

    // 3. Videos
    const videos = new Collection({
      name: 'videos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')",
      viewRule:
        "@request.auth.id != '' && (publicado = true || @request.auth.email = 'admin@canever.com.br')",
      createRule: "@request.auth.email = 'admin@canever.com.br'",
      updateRule: "@request.auth.email = 'admin@canever.com.br'",
      deleteRule: "@request.auth.email = 'admin@canever.com.br'",
      fields: [
        { name: 'titulo', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: true },
        { name: 'url_youtube', type: 'text', required: true },
        {
          name: 'categoria_id',
          type: 'relation',
          required: true,
          collectionId: categorias.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'autor', type: 'text' },
        { name: 'thumbnail_url', type: 'text' },
        { name: 'publicado', type: 'bool' },
        { name: 'data_publicacao', type: 'date' },
        { name: 'visualizacoes', type: 'number', onlyInt: true },
        { name: 'duracao_minutos', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_videos_cat_pub ON videos (categoria_id, publicado)',
        'CREATE INDEX idx_videos_created ON videos (created)',
      ],
    })
    app.save(videos)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('videos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('artigos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('categorias_conteudo'))
    } catch (_) {}
  },
)
