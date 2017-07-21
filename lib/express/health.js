import createLogger from '@meltwater/mlabs-logger'

import expressHealthy from './healthy'

export default ({
  meta = () => ({}),
  healthy = () => true,
  status = () => null,
  healthyMiddleware = expressHealthy,
  log = createLogger({noop: true})
} = {}) => (req, res, next) => {
  try {
    res.locals.isHealthCheck = true
    const currenStatus = status()
    if (currenStatus === null) log.warn('Health: Unknown')
    const isHealthy = currenStatus === null || healthy(currenStatus)
    return healthyMiddleware({isHealthy, meta: meta(), log})(req, res, next)
  } catch (err) {
    log.fatal({err}, 'Health: Fatal')
    next(err)
  }
}
