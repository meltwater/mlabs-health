import { map, prop, values } from '@meltwater/phi'
import { combineLatest as rxCombineLatest } from 'rxjs'
import { concatMap as rxConcatMap } from 'rxjs/operators/index.js'

import createHealthy from '../healthy.js'
import { createSyncCheck } from '../check.js'

export const defaultError = 'One or more health checks failing.'

export default ({ healthy = createHealthy() } = {}) => (sources = {}) => {
  const check = createSyncCheck((x) => {
    if (x !== true) throw new Error(defaultError)
    return true
  })

  return rxCombineLatest(
    ...values(map(prop('status'))(sources)),
    (...statuses) => statuses.every(healthy)
  ).pipe(rxConcatMap(check))
}
