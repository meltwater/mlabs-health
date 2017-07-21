import { map, prop } from 'ramda'
import Rx from '@reactivex/rxjs'

import createHealthy from '../healthy'
import { createSyncCheck } from '../check'

export const defaultError = 'One or more health checks failing.'

export default ({
  healthy = createHealthy()
} = {}) => (sources = {}) => {
  const check = createSyncCheck(x => {
    if (x !== true) throw new Error(defaultError)
    return true
  })

  return Rx.Observable.combineLatest(
    ...Object.values(map(prop('status'))(sources)),
    (...statuses) => statuses.every(healthy)
  ).concatMap(check)
}
