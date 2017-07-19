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
  const checks = map(createHealthCheck)(targets)
  const events = map(createHealthEvents)(checks)
  const sources = map(createHealthObservables)(events)

  const healths = mapObjIndexed((check, name) => ({
    check: checks[name],
    event: events[name],
    emit: events[name].emit,
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
