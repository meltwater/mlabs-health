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

  for (const [ id, health ] of Object.entries(healthMonitor)) {
    const isHealth = id === 'health'
    const middleware = statusMiddleware({
      status: health.status,
      meta: health.meta,
      log
    })
    if (isHealth) router.get('/', middleware)
    router.get(`/${id}`, middleware)
  }

  return router
}
