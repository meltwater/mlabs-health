export default (check, {
  maxHistory = 50000
} = {}) => {
  const health = []

  return async (...args) => {
    const date = new Date()
    const nextHealth = await check(...args)
    const { cached } = nextHealth

    if (!cached) health.unshift({...nextHealth, date})
    if (health.length > maxHistory) health.pop()

    const { healthy, error } = health[0]

    return {
      healthy,
      error,
      date,
      attempts: health.length,
      successes: health.filter(({healthy}) => healthy).length,
      failures: health.filter(({healthy}) => !healthy).length,
      health: [...health]
    }
  }
}
