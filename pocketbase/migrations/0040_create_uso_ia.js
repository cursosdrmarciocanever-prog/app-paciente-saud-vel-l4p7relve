/// <reference path="../pb_data/types.d.ts" />

// Controle de uso de IA por paciente (trava de custo).
//  - uso_ia: contador por paciente × mês (mensagens com especialista + fotos).
//  - limites_plano: limites mensais por plano (editáveis no painel admin).
// Os contadores são escritos pelos hooks (contexto elevado via $app.save), por
// isso uso_ia tem create/update bloqueados para a API (só leitura do dono/admin).
migrate(
  (app) => {
    const ADMIN =
      '@request.auth.email = "admin@canever.com.br" || @request.auth.email = "marciocanever@hotmail.com"'
    const ownerOrAdmin = '@request.auth.id != "" && (usuario_id = @request.auth.id || ' + ADMIN + ')'
    const stamps = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    // --- uso_ia ---
    const uso = new Collection({
      name: 'uso_ia',
      type: 'base',
      listRule: ownerOrAdmin,
      viewRule: ownerOrAdmin,
      createRule: null, // só hooks (elevado) / superuser
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'usuario_id', type: 'text', required: true },
        { name: 'mes', type: 'text', required: true }, // "YYYY-MM"
        { name: 'mensagens_ia', type: 'number', required: false, min: 0 },
        { name: 'fotos_analisadas', type: 'number', required: false, min: 0 },
        ...stamps,
      ],
      indexes: ['CREATE UNIQUE INDEX idx_uso_ia_user_mes ON uso_ia (usuario_id, mes)'],
    })
    app.save(uso)

    // --- limites_plano ---
    const auth = '@request.auth.id != ""'
    const limites = new Collection({
      name: 'limites_plano',
      type: 'base',
      listRule: auth, // qualquer paciente logado pode ler (para mostrar "X de Y")
      viewRule: auth,
      createRule: ADMIN,
      updateRule: ADMIN,
      deleteRule: ADMIN,
      fields: [
        { name: 'plano', type: 'text', required: true },
        { name: 'limite_mensagens', type: 'number', required: true, min: 0 },
        { name: 'limite_fotos', type: 'number', required: true, min: 0 },
        ...stamps,
      ],
      indexes: ['CREATE UNIQUE INDEX idx_limites_plano ON limites_plano (plano)'],
    })
    app.save(limites)

    // Seed "default" — usado quando o plano do paciente não tem linha própria.
    // 150 msgs + 60 fotos/mês ≈ teto de custo ~R$29/mês (pior caso).
    const seed = new Record(limites)
    seed.set('plano', 'default')
    seed.set('limite_mensagens', 150)
    seed.set('limite_fotos', 60)
    app.save(seed)
  },
  (app) => {
    for (const name of ['uso_ia', 'limites_plano']) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (e) {
        /* ignora */
      }
    }
  },
)
