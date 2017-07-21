import createLogger from '@meltwater/mlabs-logger'

export default ({
  checks = [],
  log = createLogger({noop: true})
} = {}) => async (req, res, next) => {
  try {
    res.locals.isHealthCheck = true

    if (!res.headersSent) {
      const status = 202
      req.accepts('json')
        ? res.status(status).send({accepted: true})
        : res.sendStatus(status)
    }

    await Promise.all(checks.map(check => check()))
    next()
  } catch (err) {
    log.fatal({err}, 'Health Check: Fatal')
    next(err)
  }
}
