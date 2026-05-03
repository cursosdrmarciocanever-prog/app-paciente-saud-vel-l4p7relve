routerAdd(
  'POST',
  '/backend/v1/checkout',
  (e) => {
    const body = e.requestInfo().body
    const user = e.auth

    if (!user) throw new UnauthorizedError('Não autorizado')

    const sub = $app.findRecordById('subscriptions', body.subscriptionId)
    if (sub.getString('user') !== user.id) {
      throw new ForbiddenError('Assinatura não pertence a este usuário')
    }

    const isSuccess = body.cardToken !== 'fail_token'
    const amount = sub.getFloat('monthly_price')

    const paymentsCol = $app.findCollectionByNameOrId('payments')
    const payment = new Record(paymentsCol)
    payment.set('user', user.id)
    payment.set('subscription', sub.id)
    payment.set('amount', amount)
    payment.set('method', body.method || 'cartao_credito')
    payment.set('gateway_id', 'mock_gw_' + $security.randomString(10))

    if (isSuccess) {
      payment.set('status', 'aprovado')
      payment.set('payment_date', new Date().toISOString())
      const nextRenewal = new Date()
      nextRenewal.setDate(nextRenewal.getDate() + 30)
      payment.set('next_renewal', nextRenewal.toISOString())

      sub.set('status', 'active')
      sub.set('renewal_date', nextRenewal.toISOString())

      user.set('is_paid', true)
      $app.save(user)
      $app.save(sub)
    } else {
      payment.set('status', 'recusado')
      sub.set('status', 'pending_payment')

      const failedPayments = $app.findRecordsByFilter(
        'payments',
        `subscription = '${sub.id}' && status = 'recusado'`,
        '-created',
        3,
        0,
      )
      if (failedPayments.length >= 2) {
        sub.set('status', 'suspended')

        const notifCol = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        notif.set('user', user.id)
        notif.set('title', 'Assinatura Suspensa')
        notif.set('message', 'Sua assinatura foi suspensa após 3 tentativas de cobrança falhas.')
        notif.set('is_read', false)
        $app.save(notif)
      }
      $app.save(sub)
    }

    $app.save(payment)

    if (!isSuccess) {
      throw new BadRequestError('Cartão recusado pelo gateway.')
    }

    return e.json(200, { success: true, payment: payment })
  },
  $apis.requireAuth(),
)
