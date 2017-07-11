export default (checks, {
  failureRatio = 0
} = {}) => {
  const keys = Object.keys(checks)

  return async (...args) => {
    const healths = await Promise.all(keys.map(k => checks[k](...args)))

    const strategyHealths = healths.map(({healthy, attempts, failures}) => (
      healthy || (failures / attempts <= failureRatio)
    ))

    if (strategyHealths.every(h => h)) return true

    const err = new Error('One or more health checks failing.')
    err.errors = healths.map(({error}, i) => ({
      id: keys[i],
      error: strategyHealths[i] ? null : error
    })).filter(({error}) => error !== null)
    throw err
  }
}
