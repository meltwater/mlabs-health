import cacheManager from 'cache-manager'
import uuid from 'uuid'

export const wrap = target => {
  if (typeof target === 'boolean') return async () => target
  if (typeof target === 'function') return async (...args) => target(...args)

  if (typeof target === 'object') {
    if (typeof target.health !== 'function') {
      throw new Error(
        'Object missing health method, cannot create health function from',
        target
      )
    }
    return async (...args) => target.health(...args)
  }

  throw new Error('Cannot create health function from', target)
}

export default (target, {
  ttl = 60,
  cache = cacheManager.caching({ttl, max: 1})
} = {}) => {
  const id = uuid()
  const healthCheck = wrap(target)

  let cached = false
  const checkHealth = async (...args) => {
    cached = cache !== null
    const health = cache === null
      ? await healthCheck(...args)
      : await cache.wrap(id, () => {
        cached = false
        return healthCheck(...args)
      })
    if (health !== true) throw new Error('Health check returned untrue.')
  }

  return async (...args) => {
    try {
      await checkHealth(...args)
      return {healthy: true, cached, error: null}
    } catch (error) {
      return {healthy: false, cached, error}
    }
  }
}
