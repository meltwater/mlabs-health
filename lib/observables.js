import { add, map, mergeAll } from 'ramda'
import Rx from '@reactivex/rxjs'

export const createSource = ({event, emitter}) => (
  Rx.Observable.fromEvent(emitter, event).share()
)

export const health = source => source
export const healthy = source => source.pluck('healthy')
export const unhealthy = source => healthy(source).map(x => !x)
export const error = source => source.pluck('error')
export const date = source => source.map(x => new Date())

export const attempts = source => source.map(x => 1).scan(add)
export const successes = source => healthy(source).map(x => x ? 1 : 0).scan(add)
export const failures = source => healthy(source).map(x => x ? 0 : 1).scan(add)

export const duration = source => (
  Rx.Observable.zip(
    healthy(source),
    date(source)
  ).scan(
    ([lastHealth, lastDate, total], [currentHealth, currentDate]) => ([
      currentHealth,
      currentDate,
      currentHealth === lastHealth ? total + (currentDate - lastDate) : 0
    ]),
    [null, new Date(), 0]
  ).map(x => x[2])
)

export const uptime = source => (
  Rx.Observable.zip(
    healthy(source),
    date(source)
  ).scan(
    ([lastHealth, lastDate, total], [currentHealth, currentDate]) => ([
      currentHealth,
      currentDate,
      lastHealth === true ? total + (currentDate - lastDate) : total
    ]),
    [null, new Date(), 0]
  ).map(x => x[2])
)

export const downtime = source => (
  Rx.Observable.zip(
    healthy(source),
    date(source)
  ).scan(
    ([lastHealth, lastDate, total], [currentHealth, currentDate]) => ([
      currentHealth,
      currentDate,
      lastHealth === false ? total + (currentDate - lastDate) : total
    ]),
    [null, new Date(), 0]
  ).map(x => x[2])
)

export const availability = source => Rx.Observable.zip(
  uptime(source),
  downtime(source),
  (up, down) => (up === 0 && down === 0 ? 1 : up / (up + down))
)

export const reliability = source => Rx.Observable.zip(
  attempts(source),
  successes(source),
  (attempts, successes) => (attempts === 0 ? 1 : successes / attempts)
)

export const streams = {
  attempts,
  availability,
  successes,
  failures,
  date,
  duration,
  uptime,
  downtime,
  error,
  healthy,
  reliability,
  unhealthy
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

export const createSources = source => {
  const sources = map(stream => stream(source))(streams)
  return {
    ...sources,
    health: health(source),
    status: status(source, sources)
  }
}

export default (events, {
  delay = 0,
  initialDate = new Date(),
  initialValues = [],
  ignoreCached = true
} = {}) => {
  const source = createSource(events).filter(({cached}) => (
    ignoreCached ? !cached : true
  ))

  const delayedSource = Rx.Observable.zip(
    source,
    healthy(source),
    date(source)
  ).filter(([x, isHealthy, currentDate]) => (
    isHealthy || currentDate - initialDate >= delay
  )).map(([x]) => x)

  return initialValues.length === 0
    ? createSources(delayedSource)
    : createSources(delayedSource.startWith(...initialValues))
}
