export default (healthy = true) => (req, res, next) => {
  try {
    const status = healthy ? 200 : 503

    if (req.accepts('json')) {
      res.status(status).send({healthy})
      return next()
    }

    res.sendStatus(status)
    next()
  } catch (err) {
    next(err)
  }
}
