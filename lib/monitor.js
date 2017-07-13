import createHealthStats from './stats'

export default (checks = []) => {
  const keys = Object.keys(checks)
  const allStats = keys.map(k => createHealthStats(checks[k]))

  return async (...args) => {
    const stats = await Promise.all(allStats.map(s => s(...args)))
    return Object.assign.apply({}, [{},
      ...stats.map((s, i) => ({[keys[i]]: s}))
    ])
  }
}
