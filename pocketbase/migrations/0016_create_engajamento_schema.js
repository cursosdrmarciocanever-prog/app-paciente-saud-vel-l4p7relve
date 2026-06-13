/// <reference path="../pb_data/types.d.ts" />

// Schema de engajamento do paciente: atividade física, gamificação (badges),
// hidratação e diário alimentar. Convenções iguais às demais coleções do app
// (relation para _pb_users_auth_, regras por usuario_id ou e-mail do admin).
migrate(
  (app) => {
    const ADMIN = "@request.auth.email = 'admin@canever.com.br'"
    const ownerOrAdmin = `usuario_id = @request.auth.id || ${ADMIN}`

    const userRel = {
      name: 'usuario_id',
      type: 'relation',
      required: true,
      collectionId: '_pb_users_auth_',
      cascadeDelete: true,
      maxSelect: 1,
    }
    const stamps = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    // 1. Atividade física
    const atividades = new Collection({
      name: 'atividades_fisicas',
      type: 'base',
      listRule: ownerOrAdmin,
      viewRule: ownerOrAdmin,
      createRule: ownerOrAdmin,
      updateRule: ownerOrAdmin,
      deleteRule: ownerOrAdmin,
      fields: [
        userRel,
        {
          name: 'tipo',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: [
            'caminhada',
            'corrida',
            'musculacao',
            'natacao',
            'ciclismo',
            'yoga',
            'funcional',
            'outro',
          ],
        },
        { name: 'duracao_minutos', type: 'number', required: true, min: 1 },
        { name: 'data', type: 'date', required: true },
        { name: 'calorias', type: 'number' },
        { name: 'observacoes', type: 'text' },
        ...stamps,
      ],
      indexes: [
        'CREATE INDEX idx_atividades_usuario_data ON atividades_fisicas (usuario_id, data)',
      ],
    })
    app.save(atividades)

    // 2. Badges (catálogo de conquistas) — leitura por qualquer autenticado, edição só admin
    const badges = new Collection({
      name: 'badges',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: ADMIN,
      updateRule: ADMIN,
      deleteRule: ADMIN,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'icone', type: 'text' },
        {
          name: 'tipo_criterio',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['atividades', 'refeicoes', 'hidratacao_dias'],
        },
        { name: 'meta', type: 'number', required: true, min: 1 },
        { name: 'ordem', type: 'number' },
        ...stamps,
      ],
      indexes: ['CREATE UNIQUE INDEX idx_badges_nome ON badges (nome)'],
    })
    app.save(badges)

    // 3. Badges desbloqueados pelo usuário — criados pelo hook (admin-only via API)
    const userBadges = new Collection({
      name: 'user_badges',
      type: 'base',
      listRule: ownerOrAdmin,
      viewRule: ownerOrAdmin,
      createRule: ADMIN,
      updateRule: ADMIN,
      deleteRule: ADMIN,
      fields: [
        userRel,
        {
          name: 'badge_id',
          type: 'relation',
          required: true,
          collectionId: badges.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'desbloqueado_em', type: 'date' },
        ...stamps,
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_badges_unico ON user_badges (usuario_id, badge_id)',
      ],
    })
    app.save(userBadges)

    // 4. Hidratação (um registro por usuário por dia)
    const hidratacao = new Collection({
      name: 'hidratacao',
      type: 'base',
      listRule: ownerOrAdmin,
      viewRule: ownerOrAdmin,
      createRule: ownerOrAdmin,
      updateRule: ownerOrAdmin,
      deleteRule: ownerOrAdmin,
      fields: [
        userRel,
        { name: 'data', type: 'date', required: true },
        { name: 'quantidade_ml', type: 'number', required: true, min: 0 },
        { name: 'meta_ml', type: 'number' },
        ...stamps,
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_hidratacao_usuario_dia ON hidratacao (usuario_id, data)',
      ],
    })
    app.save(hidratacao)

    // 5. Diário alimentar
    const refeicoes = new Collection({
      name: 'refeicoes',
      type: 'base',
      listRule: ownerOrAdmin,
      viewRule: ownerOrAdmin,
      createRule: ownerOrAdmin,
      updateRule: ownerOrAdmin,
      deleteRule: ownerOrAdmin,
      fields: [
        userRel,
        { name: 'data', type: 'date', required: true },
        {
          name: 'tipo_refeicao',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'],
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'calorias', type: 'number' },
        { name: 'horario', type: 'text' },
        ...stamps,
      ],
      indexes: ['CREATE INDEX idx_refeicoes_usuario_data ON refeicoes (usuario_id, data)'],
    })
    app.save(refeicoes)
  },
  (app) => {
    for (const name of [
      'refeicoes',
      'hidratacao',
      'user_badges',
      'badges',
      'atividades_fisicas',
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {}
    }
  },
)
