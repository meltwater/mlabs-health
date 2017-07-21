import createLogger from '@meltwater/mlabs-logger'

import expressHealthy from './healthy'

// TODO: Do not take healthMonitor, only status function.
export default ({
  healthy,
  healthMonitor,
  healthyMiddleware = expressHealthy,
  log = createLogger({noop: true})
} = {}) => {
  if (healthy == null) throw new Error("Missing 'healthy' function.")
  if (healthMonitor == null) throw new Error("Missing 'healthMonitor' object.")

  return (req, res, next) => {
    try {
      res.locals.isHealthCheck = true
      const status = healthMonitor.health.status()
      if (status === null) log.warn('Health: Unknown')
      const isHealthy = status === null || healthy(status)
      return healthyMiddleware({isHealthy, log})(req, res, next)
    } catch (err) {
      log.fatal({err}, 'Health: Fatal')
      next(err)
    }
  }
}
