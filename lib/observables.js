import { add, map, mergeAll } from 'ramda'
import Rx from '@reactivex/rxjs'

export const createSource = ({event, emitter}) => (
  Rx.Observable.fromEvent(emitter, event)
)

export const health = source => source
export const healthy = source => source.pluck('healthy')
export const unhealthy = source => source.pluck('healthy').map(x => !x)
export const error = source => source.pluck('error')
export const date = source => source.map(x => new Date())
export const attempts = source => source.map(x => 1).scan(add)
export const successes = source => healthy(source).map(x => x ? 1 : 0).scan(add)
export const failures = source => healthy(source).map(x => x ? 0 : 1).scan(add)

export const observables = {
  attempts,
  successes,
  failures,
  date,
  error,
  unhealthy,
  healthy
}

export const status = (source, sources = {}) => {
  const keys = Object.keys(sources)
  return source.withLatestFrom(
    ...map(k => sources[k])(keys),
    (health, ...stats) => mergeAll(stats.map((stat, i) => ({[keys[i]]: stat})))
  )
}

export const createValue = (source, initialValue = null) => {
  const subject = new Rx.BehaviorSubject(initialValue)
  source.subscribe(subject)
  return () => subject.value
}

export default (events, {
  ignoreCached = true
} = {}) => {
  const source = createSource(events).filter(({cached}) => (
    ignoreCached ? !cached : true
  ))
  const sources = map(observable => observable(source))(observables)
  return {
    ...sources,
    health: health(source),
    status: status(source, sources)
  }
}
