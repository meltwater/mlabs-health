import { propOr } from 'ramda'

export default ({
  status = () => null,
  meta = () => ({})
} = {}) => (req, res, next) => {
  try {
    const showData = req.query.data || 'true'
    const data = showData === 'true' ? status() : null
    if (data == null) return res.status(200).send({...meta(), data: null})

    const error = data.error == null
      ? data.error
      : propOr('', 'message')(data.error)

    const date = data.date == null
      ? data.date
      : data.date.toString()

    res.status(200).send({
      ...meta(),
      data: {...data, date, error}
    })
  } catch (err) {
    next(err)
  }
}
