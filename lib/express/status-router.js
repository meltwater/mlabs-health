import {
  both,
  complement,
  compose,
  filter,
  isNil,
  map,
  prop,
  toPairs
} from 'ramda'
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

    const isHealthy = filter(both(
      complement(isNil),
      prop('healthy')
    ))

    const isUnhealthy = filter(both(
      complement(isNil),
      prop('unhealthy')
    ))

    const ids = Object.keys(healthMonitor).sort()

    const healthy = Object.keys(isHealthy(statuses))
      .filter(id => id !== 'health')
      .sort()

    const unhealthy = Object.keys(isUnhealthy(statuses))
      .filter(id => id !== 'health')
      .sort()

    return {
      ...healthMonitor.health.meta(),
      healthy,
      unhealthy,
      degraded: unhealthy.length > 0,
      ids
    }
  }

  for (const [ id, health ] of toPairs(healthMonitor)) {
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
