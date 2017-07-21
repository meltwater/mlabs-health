import { Router } from 'express'
import { compose, map, propOr } from 'ramda'
import createLogger from '@meltwater/mlabs-logger'

import createHealthy from '../healthy'
import expressCheck from './check'
import expressHealth from './health'

export default ({
  healthMonitor,
  healthyMiddleware,
  healthy = createHealthy(),
  healthMiddleware = expressHealth,
  checkMiddleware = expressCheck,
  log = createLogger({noop: true})
} = {}) => {
  if (healthMonitor == null) throw new Error("Missing 'healthMonitor' instance.")

  const router = Router()
  const checks = map(compose(
    check => () => check({log}),
    propOr(() => {}, 'emit'),
    propOr({}, 'events'))
  )(Object.values(healthMonitor))

  for (const [ key, health ] of Object.entries(healthMonitor)) {
    const isHealth = key === 'health'
    router.get(
      `/${isHealth ? '' : key}`,
      healthMiddleware({
        status: health.status,
        healthy,
        healthyMiddleware,
        log
      }),
      checkMiddleware({
        checks: isHealth ? checks : () => health.events.emit({log}),
        log
      })
    )
  }

  return router
}
