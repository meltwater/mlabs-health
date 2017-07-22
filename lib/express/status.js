import { propOr } from 'ramda'

const propOrNull = propOr(null)

export default ({
  status = () => null,
  meta = () => ({})
} = {}) => (req, res, next) => {
  try {
    const showData = req.query.data || 'true'
    const data = showData === 'true' ? status() : null
    const error = propOrNull('error')(data)
    res.status(200).send({
      ...meta(),
      data: data ? {...data, error: propOrNull('message')(error)} : null
    })
    next()
  } catch (err) {
    next(err)
  }
}
