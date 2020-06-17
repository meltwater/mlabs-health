import {
  complement,
  compose,
  filter,
  groupBy,
  identity,
  isNil,
  map,
  mergeRight,
  prop,
  sortBy,
  toPairs,
  zipObj
} from '@meltwater/phi'

import createHealthy from './healthy'

export default ({ healthy = createHealthy() } = {}) => (healthMonitor) => {
  if (healthMonitor == null) {
    throw new Error("Missing 'healthMonitor' instance.")
  }
  const status = compose((s) => s(), prop('status'))
  const healths = compose(map(healthy), filter(complement(isNil)), map(status))
  return healths(healthMonitor)
}

export const groupHealthy = compose(
  mergeRight({ healthy: [], unhealthy: [] }),
  map(compose(sortBy(identity), map(prop('id')))),
  groupBy(({ healthy }) => (healthy === true ? 'healthy' : 'unhealthy')),
  compose(map(zipObj(['id', 'healthy'])), toPairs)
)
