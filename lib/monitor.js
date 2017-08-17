import { map, mapObjIndexed, prop } from 'ramda'

import createCheck from './check'
import createHealthEvents from './events'
import createHealthObservables, {
  createSources,
  createValue
} from './observables'
import { allHealthy } from './strategies'

export const createStatus = (healths = {}, {
  strategy = allHealthy()
} = {}) => {
  const observables = map(prop('observables'))(healths)
  const source = strategy(observables)
  const sources = createSources(source)
  return createValue(sources.status, null)
}

export default (targets = {}, {
  cache,
  ttl,
  delay,
  strategy = allHealthy(),
  createHealthCheck = (...args) => createCheck(...args, {ttl, cache})
} = {}) => {
  if (Object.keys(targets).includes('health')) {
    throw new Error("The key 'health' is reserved for the strategy health.")
  }

  const checks = map(createHealthCheck)(targets)
  const events = map(createHealthEvents)(checks)
  const sources = map(e => createHealthObservables(e, {delay}))(events)

  const healths = mapObjIndexed((check, id) => ({
    check: checks[id],
    events: events[id],
    observables: sources[id],
    status: createValue(sources[id].status),
    meta: () => ({id})
  }))(checks)

  const health = strategy(sources)
  const observables = createSources(health)

  return {
    ...healths,
    health: {
      observables,
      status: createValue(observables.status),
      meta: () => ({id: 'health'})
    }
  }
}
