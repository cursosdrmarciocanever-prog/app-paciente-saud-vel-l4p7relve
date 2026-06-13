routerAdd(
  'POST',
  '/backend/v1/payment/injetavel',
  (e) => {
    const body = e.requestInfo().body || {}

    const errors = {}

    if (typeof body.injetavel_id !== 'string' || body.injetavel_id.trim().length === 0) {
      errors.injetavel_id = new ValidationError('invalid_string', 'injetavel_id é obrigatório')
    }
    if (body.tipo_compra !== 'ampola' && body.tipo_compra !== 'kit') {
      errors.tipo_compra = new ValidationError('invalid_enum', 'tipo_compra deve ser ampola ou kit')
    }
    if (
      typeof body.quantidade !== 'number' ||
      !Number.isInteger(body.quantidade) ||
      body.quantidade < 1
    ) {
      errors.quantidade = new ValidationError(
        'invalid_number',
        'quantidade deve ser um número inteiro >= 1',
      )
    }
    if (body.opcao_entrega !== 'agendar_clinica' && body.opcao_entrega !== 'enviar_endereco') {
      errors.opcao_entrega = new ValidationError(
        'invalid_enum',
        'opcao_entrega deve ser agendar_clinica ou enviar_endereco',
      )
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestError('Dados inválidos', errors)
    }

    const data = {
      injetavel_id: body.injetavel_id,
      tipo_compra: body.tipo_compra,
      quantidade: body.quantidade,
      opcao_entrega: body.opcao_entrega,
      slot_id: body.slot_id,
      endereco: body.endereco,
      card_number: body.card_number,
    }
    const user = e.auth
    if (!user) throw new UnauthorizedError('Não autenticado')

    return $app.runInTransaction((txApp) => {
      let injetavel
      try {
        injetavel = txApp.findRecordById('injetaveis', data.injetavel_id)
      } catch (_) {
        throw new BadRequestError('Injetável não encontrado')
      }

      const precoUnitario =
        data.tipo_compra === 'kit'
          ? injetavel.getFloat('preco_kit')
          : injetavel.getFloat('preco_ampola')
      const subtotal = precoUnitario * data.quantidade
      const taxaEnvio = data.opcao_entrega === 'enviar_endereco' ? 30.0 : 0
      const precoTotal = subtotal + taxaEnvio

      let paymentId = 'pi_mock_' + $security.randomString(16)

      // Call Stripe API if key is available
      const stripeKey = $secrets.get('STRIPE_SECRET_KEY')
      if (stripeKey) {
        try {
          const stripeRes = $http.send({
            url: 'https://api.stripe.com/v1/payment_intents',
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + stripeKey,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body:
              'amount=' +
              Math.round(precoTotal * 100) +
              '&currency=brl&payment_method=pm_card_visa&confirm=true&automatic_payment_methods[enabled]=true&automatic_payment_methods[allow_redirects]=never',
          })
          if (stripeRes.statusCode !== 200) {
            $app
              .logger()
              .error('Stripe payment error', 'status', stripeRes.statusCode, 'body', stripeRes.json)
            throw new BadRequestError('Falha ao processar pagamento. Verifique os dados do cartão.')
          }
          paymentId = stripeRes.json?.id || paymentId
        } catch (err) {
          if (err instanceof BadRequestError) throw err
          $app.logger().error('Stripe network error', 'message', err.message)
          throw new BadRequestError('Falha na comunicação com o gateway de pagamento')
        }
      }

      // Verify slot if scheduling
      let slot = null
      if (data.opcao_entrega === 'agendar_clinica') {
        if (!data.slot_id) throw new BadRequestError('Horário não selecionado')
        try {
          slot = txApp.findRecordById('slots_disponiveis', data.slot_id)
          if (slot.getBool('agendado')) {
            throw new BadRequestError('Este horário já não está mais disponível.')
          }
        } catch (err) {
          if (err instanceof BadRequestError) throw err
          throw new BadRequestError('Horário não encontrado')
        }
      }

      // Create Pedido
      const pedidosCol = txApp.findCollectionByNameOrId('pedidos_injetaveis')
      const pedido = new Record(pedidosCol)
      pedido.set('usuario_id', user.id)
      pedido.set('injetavel_id', injetavel.id)
      pedido.set('tipo_compra', data.tipo_compra)
      pedido.set('quantidade', data.quantidade)
      pedido.set('preco_total', precoTotal)
      pedido.set('opcao_entrega', data.opcao_entrega)
      pedido.set('status', 'pago')
      pedido.set('stripe_payment_id', paymentId)

      if (data.opcao_entrega === 'enviar_endereco' && data.endereco) {
        pedido.set('endereco_entrega', data.endereco)
      } else if (data.opcao_entrega === 'agendar_clinica' && slot) {
        pedido.set('data_agendamento', slot.get('data'))
      }

      txApp.save(pedido)

      // Handle Agendamento
      if (data.opcao_entrega === 'agendar_clinica' && slot) {
        const agendamentosCol = txApp.findCollectionByNameOrId('agendamentos')
        const agendamento = new Record(agendamentosCol)
        agendamento.set('usuario_id', user.id)
        agendamento.set('slot_id', slot.id)
        agendamento.set('data_agendamento', slot.get('data'))
        agendamento.set('hora_agendamento', slot.getString('hora_inicio'))
        agendamento.set('status', 'confirmado')
        agendamento.set('tipo_consulta', 'presencial')
        agendamento.set(
          'notas',
          'Aplicação de injetável: ' + injetavel.getString('nome') + ' (Pedido: ' + pedido.id + ')',
        )
        txApp.save(agendamento)

        slot.set('agendado', true)
        txApp.save(slot)
      }

      return e.json(200, { pedido_id: pedido.id })
    })
  },
  $apis.requireAuth(),
)
