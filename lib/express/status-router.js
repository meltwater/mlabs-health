import { Router } from 'express'
import { compose, map, propOr } from 'ramda'
import createLogger from '@meltwater/mlabs-logger'

import expressStatus from './status'

export default ({
  healthMonitor,
  statusMiddleware = expressStatus,
  log = createLogger({noop: true})
} = {}) => {
  if (healthMonitor == null) throw new Error("Missing 'healthMonitor' instance.")

  const router = Router()

  for (const [ key, health ] of Object.entries(healthMonitor)) {
    const isHealth = key === 'health'
    router.get(
      `/${isHealth ? '' : key}`,
      statusMiddleware({status: health.status, log})
    )
  }

  return router
}
