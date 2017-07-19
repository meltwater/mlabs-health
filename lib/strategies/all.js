import { compose, map, values } from 'ramda'
import Rx from '@reactivex/rxjs'

import { createSyncCheck } from '../check'

export const defaultError = 'One or more health checks failing.'

export default ({
  failureRatio = 0
} = {}) => (sources = {}) => {
  const isHealthy = (healthy, attempts, failures) => (
    healthy || (failures / attempts < failureRatio)
  )

  const strategyHealth = ({healthy, attempts, failures}) => (
    Rx.Observable.zip(
      healthy,
      attempts,
      failures,
      isHealthy
    )
  )

  const strategyHealths = compose(
    values,
    map(strategyHealth)
  )(sources)

  const check = createSyncCheck(x => {
    if (x !== true) throw new Error(defaultError)
    return true
  })

  return Rx.Observable.combineLatest(
    ...strategyHealths,
    (...healths) => healths.every(x => x)
  ).concatMap(check)
}
