routerAdd(
  'GET',
  '/backend/v1/appointments/occupied',
  (e) => {
    const start = e.request.url.query().get('start') || ''
    const end = e.request.url.query().get('end') || ''
    const type = e.request.url.query().get('type') || ''

    if (!start || !end) {
      return e.badRequestError('start and end are required')
    }

    let maxPresencial = 5
    let maxTele = 10
    try {
      const settings = $app.findFirstRecordByFilter('settings', '1=1')
      maxPresencial = settings.getInt('max_daily_presencial')
      maxTele = settings.getInt('max_daily_telemedicina')
    } catch (_) {}

    const records = $app.findRecordsByFilter(
      'appointments',
      "date >= {:start} && date <= {:end} && status != 'cancelado'",
      '',
      1000,
      0,
      { start: start, end: end },
    )

    const occupied = []
    const counts = {}

    for (let i = 0; i < records.length; i++) {
      const rec = records[i]
      const dateStr = rec.getString('date')

      occupied.push(dateStr)

      const day = dateStr.split(' ')[0]
      const rType = rec.getString('type')

      if (!counts[day]) counts[day] = { presencial: 0, telemedicina: 0 }
      if (rType === 'presencial') counts[day].presencial++
      if (rType === 'telemedicina') counts[day].telemedicina++
    }

    for (const day in counts) {
      const pFull = counts[day].presencial >= maxPresencial
      const tFull = counts[day].telemedicina >= maxTele

      let isFull = false
      if (type === 'presencial') isFull = pFull
      else if (type === 'telemedicina') isFull = tFull
      else isFull = pFull && tFull // if no type specified, block day only if BOTH are full

      if (isFull) {
        occupied.push(day + ' FULL')
      }
    }

    return e.json(200, occupied)
  },
  $apis.requireAuth(),
)
