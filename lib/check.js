import cacheManager from 'cache-manager'
import { has, isNil } from 'ramda'
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
  cache = cacheManager.caching({ttl, max: 1})
} = {}) => {
  const id = uuid()
  const healthCheck = wrap(target)

  const getHealth = async (...args) => {
    try {
      const health = await healthCheck(...args)
      const hasHealthy = typeof health === 'object' && !isNil(health.healthy)
      const hasHealth = typeof health === 'object' && !isNil(health.health)
      if (hasHealthy) return health.healthy
      if (hasHealth) return await wrap(health)(...args)
      return health
    } catch (err) {
      return {err}
    }
  }

  let cached = false
  const checkHealth = async (...args) => {
    cached = cache !== null

    const health = cache === null
      ? await getHealth(...args)
      : await cache.wrap(id, () => {
        cached = false
        return getHealth(...args)
      })

    if (health !== true) {
      if (has('err', health)) throw health.err
      throw new Error(defaultError)
    }
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
