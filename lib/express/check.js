import createLogger from '@meltwater/mlabs-logger'

export default ({
  checks = [],
  sendResponse = true,
  log = createLogger({noop: true})
} = {}) => async (req, res, next) => {
  try {
    res.locals.isHealthCheck = true

    if (sendResponse) {
      const status = 202
      req.accepts('json')
        ? res.status(status).send({accepted: true})
        : res.sendStatus(status)
    }

    await Promise.all(checks.map(check => check()))
    if (!sendResponse) next()
  } catch (err) {
    log.fatal({err}, 'Health Check: Fatal')
    next(err)
  }
}
