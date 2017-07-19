import { map, mapObjIndexed } from 'ramda'

import createCheck from './check'
import createHealthEvents from './events'
import createHealthObservables, {
  createSources,
  createValue
} from './observables'
import { allHealthy } from './strategies'

export default (targets = {}, {
  strategy = allHealthy(),
  createHealthCheck = createCheck
}) => {
  if (Object.keys(targets).includes('health')) {
    throw new Error("The key 'health' is reserved for the strategy health.")
  }
  const checks = map(createHealthCheck)(targets)
  const events = map(createHealthEvents)(checks)
  const sources = map(createHealthObservables)(events)

  const healths = mapObjIndexed((check, name) => ({
    check: checks[name],
    events: events[name],
    observables: sources[name],
    status: createValue(sources[name].status)
  }))(checks)

  const health = strategy(sources)
  const observables = createSources(health, {
    initialValue: {healthy: true, cached: false, error: null}
  })

  return {
    ...healths,
    health: {
      observables,
      status: createValue(observables.status)
    }
  }
}
