import createLogger from '@meltwater/mlabs-logger'

export default ({
  meta = {},
  isHealthy = true,
  sendResponse = true,
  log = createLogger({noop: true})
} = {}) => (req, res, next) => {
  try {
    res.locals.isHealthCheck = true
    const status = isHealthy ? 200 : 503

    if (!sendResponse) {
      res.status(status)
      return next()
    }

    req.accepts('json')
      ? res.status(status).send({healthy: isHealthy, ...meta})
      : res.sendStatus(status)
  } catch (err) {
    log.fatal({err}, 'Healthy: Fatal')
    next(err)
  }
}
