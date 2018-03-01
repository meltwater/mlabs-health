import cacheManager from 'cache-manager'
import { has, isNil, isNotNil, sleeP } from '@meltwater/phi'
import uuid from 'uuid'

export const defaultError = 'Health check returned untrue.'

export const wrap = target => {
  if (typeof target === 'boolean') return async () => target
  if (typeof target === 'function') return async (...args) => target(...args)

  if (target != null && typeof target === 'object') {
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

const withTimeout = (ms, promise) => new Promise((resolve, reject) => {
  const err = `Health check timed out after ${ms} ms`
  sleeP(ms).then(() => reject(new Error(err))).catch(reject)
  promise.then(resolve).catch(reject)
})

const formatHealth = (health, cached) => {
  const hasHealthy = typeof health === 'object' && !isNil(health.healthy)

  if (hasHealthy) return {cached, error: null, ...health}

  if (health !== true) {
    const unhealthy = error => ({healthy: false, cached, error})
    if (has('err', health)) return unhealthy(health.err)
    return unhealthy(new Error(defaultError))
  }

  return {healthy: true, cached, error: null}
}

/*
 * Creating an observable stream from an async function containing
 * the await keyword fails when used with concatMap.
 * This internal function is provided for creating observable steams
 * which emit promise wrapped health check objects
 * consistent with the async counterpart.
 * TODO: Replace use of this method when possible.
 * See https://github.com/ReactiveX/rxjs/issues/1497.
 */
export const createSyncCheck = target => (...args) => {
  if (typeof target !== 'function') {
    throw new Error('Cannot create sync health function from', target)
  }

  try {
    const check = target
    const health = check(...args)
    if (health !== true) throw new Error(defaultError)
    return Promise.resolve({healthy: true, cached: false, error: null})
  } catch (error) {
    return Promise.resolve({healthy: false, cached: false, error})
  }
}

export default (target, {
  ttl = 60,
  timeout = 60 * 1000,
  cache = cacheManager.caching({ttl, max: 1})
} = {}) => {
  const id = uuid()
  const healthCheck = wrap(target)

  const getHealth = async (...args) => {
    try {
      const health = await healthCheck(...args)
      const hasHealth = typeof health === 'object' && !isNil(health.health)
      if (hasHealth) return await wrap(health)(...args)
      return health
    } catch (err) {
      return {err}
    }
  }

  const getHealthWithTimeout = (...args) => (
    withTimeout(timeout, getHealth(...args))
  )

  const checkHealth = async (...args) => {
    if (cache === null) {
      const health = await getHealthWithTimeout(...args)
      return formatHealth(health, false)
    }

    const healthFromCache = await cache.get(id)
    if (isNotNil(healthFromCache)) return formatHealth(healthFromCache, true)

    const freshHealth = await getHealthWithTimeout(...args)
    await cache.set(id, freshHealth)
    return formatHealth(freshHealth, false)
  }

  return async (...args) => {
    try {
      return await checkHealth(...args)
    } catch (error) {
      return {healthy: false, cached: false, error}
    }
  }
}
