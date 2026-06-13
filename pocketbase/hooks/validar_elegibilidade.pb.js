routerAdd(
  'POST',
  '/backend/v1/validar-elegibilidade',
  (e) => {
    const body = e.requestInfo().body || {}
    const usuario_id = body.usuario_id
    const data_desejada = body.data_desejada

    if (typeof usuario_id !== 'string' || !usuario_id) {
      throw new BadRequestError('Dados inválidos', {
        usuario_id: new ValidationError('invalid_usuario_id', 'ID do usuário é obrigatório'),
      })
    }

    const desiredDate = new Date(data_desejada)
    if (isNaN(desiredDate.getTime())) {
      throw new BadRequestError('Dados inválidos', {
        data_desejada: new ValidationError('invalid_date', 'Data inválida'),
      })
    }
    const authRecord = e.auth

    if (!authRecord || authRecord.id !== usuario_id) {
      $app
        .logger()
        .warn(
          'Tentativa não autorizada de validação de elegibilidade',
          'auth_id',
          authRecord ? authRecord.id : 'null',
          'req_usuario_id',
          usuario_id,
        )
      throw new ForbiddenError('Não autorizado a validar elegibilidade para este usuário')
    }

    $app
      .logger()
      .info(
        'Iniciando validação de elegibilidade',
        'usuario_id',
        usuario_id,
        'data_desejada',
        data_desejada,
      )

    try {
      const desiredYear = desiredDate.getFullYear()
      const yearStart = new Date(desiredYear, 0, 1)
      const yearEnd = new Date(desiredYear, 11, 31, 23, 59, 59, 999)

      const agendamentos = $app.findRecordsByFilter(
        'agendamentos',
        "usuario_id = {:usuario_id} && (status = 'confirmado' || status = 'realizado')",
        '-data_agendamento',
        1000,
        0,
        { usuario_id },
      )

      let countThisYear = 0
      let mostRecentDate = null

      for (const record of agendamentos) {
        const dataAgendamentoStr = record.getString('data_agendamento')
        if (!dataAgendamentoStr) continue

        const recordDate = new Date(dataAgendamentoStr)

        if (!mostRecentDate || recordDate > mostRecentDate) {
          mostRecentDate = recordDate
        }

        if (recordDate >= yearStart && recordDate <= yearEnd) {
          countThisYear++
        }
      }

      if (countThisYear >= 4) {
        $app
          .logger()
          .info('Validação falhou: limite anual', 'usuario_id', usuario_id, 'count', countThisYear)
        return e.json(200, {
          elegivel: false,
          motivo: 'Você atingiu o limite de 4 consultas este ano',
        })
      }

      if (mostRecentDate) {
        const d1 = new Date(
          desiredDate.getFullYear(),
          desiredDate.getMonth(),
          desiredDate.getDate(),
        )
        const d2 = new Date(
          mostRecentDate.getFullYear(),
          mostRecentDate.getMonth(),
          mostRecentDate.getDate(),
        )
        const daysSinceLast = Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceLast < 90) {
          const nextAllowedDate = new Date(mostRecentDate)
          nextAllowedDate.setDate(nextAllowedDate.getDate() + 90)
          const daysRemaining = 90 - daysSinceLast

          const yyyy = nextAllowedDate.getFullYear()
          const mm = String(nextAllowedDate.getMonth() + 1).padStart(2, '0')
          const dd = String(nextAllowedDate.getDate()).padStart(2, '0')

          $app
            .logger()
            .info(
              'Validação falhou: intervalo 90 dias',
              'usuario_id',
              usuario_id,
              'daysSinceLast',
              daysSinceLast,
            )
          return e.json(200, {
            elegivel: false,
            motivo: `Você pode agendar em ${daysRemaining} dias`,
            proxima_data_permitida: `${yyyy}-${mm}-${dd}`,
          })
        }
      }

      $app.logger().info('Validação aprovada', 'usuario_id', usuario_id)
      return e.json(200, {
        elegivel: true,
        motivo: 'Você pode agendar',
      })
    } catch (err) {
      $app
        .logger()
        .error(
          'Erro interno ao validar',
          'usuario_id',
          usuario_id,
          'error',
          err.message || err.toString(),
        )
      throw new InternalServerError('Erro interno ao processar a validação de elegibilidade')
    }
  },
  $apis.requireAuth(),
)
