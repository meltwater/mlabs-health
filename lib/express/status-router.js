import { map, prop } from 'ramda'
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

  const meta = () => {
    const statuses = map(prop('status'))(healthMonitor)
    const healthy = []
    const unhealthy = []
    return {
      ...healthMonitor.health.meta(),
      healthy,
      unhealthy,
      healths: Object.keys(healthMonitor),
      degraded: unhealthy.length > 0
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
