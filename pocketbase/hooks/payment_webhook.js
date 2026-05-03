routerAdd('POST', '/backend/v1/webhooks/payments', (e) => {
  const body = e.requestInfo().body
  const gatewayId = body.gateway_id
  const status = body.status

  try {
    const payment = $app.findFirstRecordByData('payments', 'gateway_id', gatewayId)
    payment.set('status', status)

    const sub = $app.findRecordById('subscriptions', payment.getString('subscription'))

    if (status === 'aprovado') {
      payment.set('payment_date', new Date().toISOString())
      const nextRenewal = new Date()
      nextRenewal.setDate(nextRenewal.getDate() + 30)
      payment.set('next_renewal', nextRenewal.toISOString())

      sub.set('status', 'active')
      sub.set('renewal_date', nextRenewal.toISOString())

      const user = $app.findRecordById('users', sub.getString('user'))
      user.set('is_paid', true)
      $app.save(user)
    } else if (status === 'recusado') {
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
        notif.set('user', sub.getString('user'))
        notif.set('title', 'Assinatura Suspensa')
        notif.set('message', 'Sua assinatura foi suspensa após 3 tentativas de cobrança falhas.')
        notif.set('is_read', false)
        $app.save(notif)
      }
    } else if (status === 'reembolsado') {
      sub.set('status', 'canceled')
    }

    $app.save(payment)
    $app.save(sub)

    return e.json(200, { success: true })
  } catch (err) {
    return e.internalServerError('Failed to process webhook')
  }
})
