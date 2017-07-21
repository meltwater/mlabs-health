import createLogger from '@meltwater/mlabs-logger'

export default ({
  meta = {},
  isHealthy = true,
  log = createLogger({noop: true})
} = {}) => (req, res, next) => {
  try {
    res.locals.isHealthCheck = true
    const status = isHealthy ? 200 : 503

    if (req.accepts('json')) {
      res.status(status).send({healthy: isHealthy, ...meta})
      return next()
    }

    res.sendStatus(status)
    next()
  } catch (err) {
    log.fatal({err}, 'Healthy: Fatal')
    next(err)
  }
}
