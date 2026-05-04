onRecordValidate((e) => {
  const type = e.record.getString('type')
  const dateStr = e.record.getString('date')
  const status = e.record.getString('status')

  if (!type || !dateStr) return e.next()
  if (status === 'cancelado') return e.next()

  const day = dateStr.split(' ')[0]

  let maxPresencial = 5
  let maxTele = 10
  try {
    const settings = $app.findFirstRecordByFilter('settings', '1=1')
    maxPresencial = settings.getInt('max_daily_presencial')
    maxTele = settings.getInt('max_daily_telemedicina')
  } catch (_) {}

  const maxAllowed = type === 'presencial' ? maxPresencial : maxTele

  const id = e.record.id || ''
  const filter = `date >= '${day} 00:00:00' && date <= '${day} 23:59:59' && type = '${type}' && status != 'cancelado' && id != '${id}'`

  const count = $app.countRecords('appointments', filter)

  if (count >= maxAllowed) {
    const errors = {}
    errors['date'] = new ValidationError(
      'capacity_reached',
      `O limite diário para consultas do tipo ${type} foi atingido (${maxAllowed}).`,
    )
    throw new BadRequestError('Capacidade diária atingida.', errors)
  }

  e.next()
}, 'appointments')
