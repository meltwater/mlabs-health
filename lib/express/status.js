export default ({status = () => null} = {}) => (req, res, next) => {
  try {
    res.status(200).send({data: status()})
    next()
  } catch (err) {
    next(err)
  }
}
