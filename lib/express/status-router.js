import { compose, filter, map, prop, propSatisfies } from 'ramda'
import { Router } from 'express'
import createLogger from '@meltwater/mlabs-logger'

import expressStatus from './status'

export default ({
  healthMonitor,
  statusMiddleware = expressStatus,
  log = createLogger({noop: true})
} = {}) => {
  if (healthMonitor == null) throw new Error("Missing 'healthMonitor' instance.")

  const router = Router()

  const meta = (detail = 'full') => {
    const statuses = map(
      compose(status => status(), prop('status'))
    )(healthMonitor)
    const isHealthy = filter(propSatisfies(x => x, 'healthy'))
    const isUnhealthy = filter(propSatisfies(x => !x, 'healthy'))
    const healthy = Object.keys(isHealthy(statuses)).filter(id => id !== 'health')
    const unhealthy = Object.keys(isUnhealthy(statuses)).filter(id => id !== 'health')
    // TODO: Where to show all statuses?
    // const all = Object.values(mapObjIndexed((v, id) => ({id, ...v}))(statuses))
    return {
      ...healthMonitor.health.meta(),
      healthy,
      unhealthy,
      degraded: unhealthy.length > 0,
      ids: Object.keys(healthMonitor)
    }
  }

  for (const [ id, health ] of Object.entries(healthMonitor)) {
    const isHealth = id === 'health'
    const middleware = statusMiddleware({
      status: health.status,
      meta: isHealth ? meta : health.meta,
      log
    })
    if (isHealth) router.get('/', middleware)
    router.get(`/${id}`, middleware)
  }

  return router
}
