import { Router } from 'express'
import { compose, map, propOr, toPairs, values } from 'ramda'
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
  )(values(healthMonitor))

  for (const [ id, health ] of toPairs(healthMonitor)) {
    const isHealth = id === 'health'
    router.get(
      `/${isHealth ? '' : id}`,
      healthMiddleware({
        meta: health.meta,
        status: health.status,
        healthy,
        healthyMiddleware,
        log
      }),
      checkMiddleware({
        sendResponse: false,
        checks: isHealth ? checks : [() => health.events.emit({log})],
        log
      }),
      (req, res, next) => { res.end() }
    )
  }

  return router
}
