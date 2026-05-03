migrate(
  (app) => {
    const videos = app.findCollectionByNameOrId('videos')
    const videoData = [
      {
        title: 'Treino HIIT Iniciante',
        description: '15 minutos de suor e queima de gordura para fazer em casa sem equipamentos.',
        video_url: 'https://www.youtube.com/embed/ml6cT4AZdqI',
        category: 'Treinos em Casa',
      },
      {
        title: 'Receita: Panqueca Fit',
        description: 'Aprenda a fazer uma panqueca deliciosa, rica em proteínas e super saudável.',
        video_url: 'https://www.youtube.com/embed/ml6cT4AZdqI',
        category: 'Receitas Fit',
      },
      {
        title: 'Mindset para Emagrecer',
        description: 'Como manter o foco na dieta e não desistir nos primeiros obstáculos.',
        video_url: 'https://www.youtube.com/embed/ml6cT4AZdqI',
        category: 'Mentalidade/Mindset',
      },
    ]

    for (const v of videoData) {
      try {
        app.findFirstRecordByData('videos', 'title', v.title)
      } catch (_) {
        const record = new Record(videos)
        record.set('title', v.title)
        record.set('description', v.description)
        record.set('video_url', v.video_url)
        record.set('category', v.category)
        app.save(record)
      }
    }

    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
      const notifications = app.findCollectionByNameOrId('notifications')

      try {
        app.findFirstRecordByData('notifications', 'title', 'Bem-vindo ao Novo App!')
      } catch (_) {
        const n = new Record(notifications)
        n.set('user', user.id)
        n.set('title', 'Bem-vindo ao Novo App!')
        n.set(
          'message',
          'Explore as novas funcionalidades: biblioteca de vídeos, agendamento de consultas e muito mais. Não esqueça de verificar seu plano na seção de assinaturas.',
        )
        n.set('is_read', false)
        app.save(n)
      }
    } catch (_) {
      // User might not exist
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM videos').execute()
    app.db().newQuery('DELETE FROM notifications').execute()
  },
)
