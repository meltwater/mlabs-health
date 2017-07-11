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
  errorHistory = 5,
  ttl = 60,
  cache = cacheManager.caching({ttl, max: 1})
} = {}) => {
  const healthCheck = wrap(target)

  let attempts = 0
  let failures = 0
  let errors = []
  const checkHealth = async (...args) => {
    attempts++

    if (!Number.isSafeInteger(attempts)) {
      attempts = 0
      failures = 0
    }

    try {
      const health = await cache.wrap(uuid(), () => healthCheck(...args))
      if (health !== true) throw new Error('Health check returned untrue.')
    } catch (err) {
      failures++
      const totalErrors = errors.unshift(err)
      if (totalErrors > errorHistory) errors.pop()
      throw err
    }
  }

  return async (...args) => {
    try {
      await checkHealth(...args)
      return {failures, attempts, errors, healthy: true, error: null}
    } catch (error) {
      return {failures, attempts, errors, healthy: false, error}
    }
  }
}
