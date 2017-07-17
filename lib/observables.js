import { map, mergeAll } from 'ramda'
import Rx from '@reactivex/rxjs'

export const createSource = ({event, emitter}) => (
  Rx.Observable.fromEvent(emitter, event)
)

export const health = source => source
export const healthy = source => source.pluck('healthy')

export const observables = {
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
  return () => subject.getValue()
}

export default events => {
  const source = createSource(events)
  const sources = map(observable => observable(source))(observables)
  return {
    ...sources,
    health: health(source),
    status: status(source, sources)
  }
}
