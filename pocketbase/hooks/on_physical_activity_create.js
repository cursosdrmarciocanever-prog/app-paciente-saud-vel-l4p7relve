onRecordAfterCreateSuccess((e) => {
  const activity = e.record
  const userId = activity.getString('user')
  let user
  try {
    user = $app.findRecordById('users', userId)
  } catch (_) {
    return e.next()
  }

  // Only paid users have access to badges system in general
  if (!user.getBool('is_paid')) {
    return e.next()
  }

  const dailyGoal = user.getInt('daily_goal_minutes') || 30
  const weeklyGoal = user.getInt('weekly_goal') || 3

  const allActivities = $app.findRecordsByFilter(
    'physical_activity',
    `user = '${userId}'`,
    '-date',
    0,
    0,
  )

  const activeDates = []
  allActivities.forEach((a) => {
    if (a.getInt('duration_minutes') >= dailyGoal) {
      const dStr = a.getString('date').split(' ')[0]
      if (!activeDates.includes(dStr)) activeDates.push(dStr)
    }
  })

  activeDates.sort((a, b) => b.localeCompare(a))

  let streak = 0
  if (activeDates.length > 0) {
    const parseDate = (s) => {
      const p = s.split('-')
      return new Date(Date.UTC(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])))
    }

    let lastDate = parseDate(activeDates[0])
    let todayStr = new Date().toISOString().split('T')[0]
    let today = parseDate(todayStr)

    let diffTime = Math.abs(today.getTime() - lastDate.getTime())
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) {
      streak = 1
      for (let i = 1; i < activeDates.length; i++) {
        let curr = parseDate(activeDates[i])
        let prev = parseDate(activeDates[i - 1])
        let d = Math.round(Math.abs(prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
        if (d === 1) {
          streak++
        } else {
          break
        }
      }
    }
  }

  const totalActivities = activeDates.length

  let daysInLast7 = 0
  const parseDateForWeekly = (s) => {
    const p = s.split('-')
    return new Date(Date.UTC(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])))
  }
  let todayStrForWeekly = new Date().toISOString().split('T')[0]
  let now = parseDateForWeekly(todayStrForWeekly)
  activeDates.forEach((dStr) => {
    let d = parseDateForWeekly(dStr)
    let diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    if (diff <= 7 && diff >= 0) {
      daysInLast7++
    }
  })
  const weeklyMet = daysInLast7 >= weeklyGoal ? 1 : 0

  const allBadges = $app.findRecordsByFilter('badges', '1=1', '', 0, 0)
  const userBadges = $app.findRecordsByFilter('user_badges', `user = '${userId}'`, '', 0, 0)
  const earnedBadgeIds = userBadges.map((ub) => ub.getString('badge'))

  const userBadgeCol = $app.findCollectionByNameOrId('user_badges')

  allBadges.forEach((b) => {
    if (earnedBadgeIds.includes(b.id)) return

    let earned = false
    let req = b.getInt('requirement_value')
    let type = b.getString('type')

    if (type === 'first_log' && totalActivities >= 1) earned = true
    if (type === 'streak_days' && streak >= req) earned = true
    if (type === 'weekly_goals_met' && weeklyMet >= req) earned = true
    if (type === 'total_activities' && totalActivities >= req) earned = true

    if (earned) {
      const ub = new Record(userBadgeCol)
      ub.set('user', userId)
      ub.set('badge', b.id)
      ub.set('earned_at', new Date().toISOString())
      $app.save(ub)
    }
  })

  return e.next()
}, 'physical_activity')
