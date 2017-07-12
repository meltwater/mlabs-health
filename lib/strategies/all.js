import createHealthStats from '../stats'

export default (checks = {}, {
  failureRatio = 0
} = {}) => {
  const keys = Object.keys(checks)
  const allHealthStats = keys.map(k => createHealthStats(checks[k]))

  return async (...args) => {
    const stats = await Promise.all(allHealthStats.map(s => s(...args)))

    const strategyHealths = stats.map(({healthy, attempts, failures}) => (
      healthy || (failures / attempts <= failureRatio)
    ))

    if (strategyHealths.every(h => h)) return true

    const err = new Error('One or more health checks failing.')
    err.errors = stats.map(({error}, i) => ({
      id: keys[i],
      error: strategyHealths[i] ? null : error
    })).filter(({error}) => error !== null)
    throw err
  }
}
