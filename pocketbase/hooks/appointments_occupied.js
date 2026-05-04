routerAdd(
  'GET',
  '/backend/v1/appointments/occupied',
  (e) => {
    const start = e.request.url.query().get('start') || ''
    const end = e.request.url.query().get('end') || ''

    if (!start || !end) {
      return e.badRequestError('start and end are required')
    }

    const records = $app.findRecordsByFilter(
      'appointments',
      "date >= {:start} && date <= {:end} && status != 'cancelado'",
      '',
      1000,
      0,
      { start: start, end: end },
    )

    const occupied = []
    for (let i = 0; i < records.length; i++) {
      occupied.push(records[i].getString('date'))
    }

    return e.json(200, occupied)
  },
  $apis.requireAuth(),
)
