import { add, map, mergeAll } from '@meltwater/phi'
import {
  BehaviorSubject,
  fromEvent,
  pipe as rxPipe,
  zip as rxZip
} from 'rxjs'
import {
  filter as rxFilter,
  map as rxMap,
  pluck as rxPluck,
  scan as rxScan,
  share as rxShare,
  startWith as rxStartWith,
  withLatestFrom as rxWithLatestFrom
} from 'rxjs/operators'

export const createSource = ({ event, emitter }) => (
  fromEvent(emitter, event).pipe(rxShare())
)

export const health = source => source
export const healthy = source => source.pipe(rxPluck('healthy'))
export const unhealthy = source => healthy(source).pipe(rxMap(x => !x))
export const error = source => source.pipe(rxPluck('error'))
export const date = source => source.pipe(rxMap(x => new Date()))

export const attempts = source => source.pipe(rxPipe(rxMap(x => 1), rxScan(add)))
export const successes = source => healthy(source).pipe(rxPipe(rxMap(x => x ? 1 : 0), rxScan(add)))
export const failures = source => healthy(source).pipe(rxPipe(rxMap(x => x ? 0 : 1), rxScan(add)))

export const duration = source => (
  rxZip(
    healthy(source),
    date(source)
  ).pipe(rxPipe(
    rxScan(
      ([lastHealth, lastDate, total], [currentHealth, currentDate]) => ([
        currentHealth,
        currentDate,
        currentHealth === lastHealth ? total + (currentDate - lastDate) : 0
      ]),
      [null, new Date(), 0]
    ),
    rxMap(x => x[2])
  ))
)

export const count = source => (
  rxZip(
    healthy(source),
    healthy(source).pipe(rxMap(() => 1))
  ).pipe(rxPipe(
    rxScan(
      ([lastHealth, lastCount, total], [currentHealth, unity]) => ([
        currentHealth,
        unity,
        currentHealth === lastHealth ? total + unity : unity
      ]),
      [null, 0, 0]
    ),
    rxMap(x => x[2])
  ))
)

export const uptime = source => (
  rxZip(
    healthy(source),
    date(source)
  ).pipe(rxPipe(
    rxScan(
      ([lastHealth, lastDate, total], [currentHealth, currentDate]) => ([
        currentHealth,
        currentDate,
        lastHealth === true ? total + (currentDate - lastDate) : total
      ]),
      [null, new Date(), 0]
    ),
    rxMap(x => x[2])
  ))
)

export const downtime = source => (
  rxZip(
    healthy(source),
    date(source)
  ).pipe(rxPipe(
    rxScan(
      ([lastHealth, lastDate, total], [currentHealth, currentDate]) => ([
        currentHealth,
        currentDate,
        lastHealth === false ? total + (currentDate - lastDate) : total
      ]),
      [null, new Date(), 0]
    ),
    rxMap(x => x[2])
  ))
)

export const availability = source => rxZip(
  uptime(source),
  downtime(source),
  (up, down) => (up === 0 && down === 0 ? 1 : up / (up + down))
)

export const reliability = source => rxZip(
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
  count,
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
  return source.pipe(rxWithLatestFrom(
    ...map(k => sources[k])(keys),
    (health, ...stats) => mergeAll(stats.map((stat, i) => ({ [keys[i]]: stat })))
  ))
}

export const createValue = (source, initialValue = null) => {
  const subject = new BehaviorSubject(initialValue)
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
  const source = createSource(events).pipe(rxFilter(({ cached }) => (
    ignoreCached ? !cached : true
  )))

  const delayedSource = rxZip(
    source,
    healthy(source),
    date(source)
  ).pipe(rxPipe(
    rxFilter(([x, isHealthy, currentDate]) => (
      isHealthy || currentDate - initialDate >= delay
    )),
    rxMap(([x]) => x)
  ))

  return initialValues.length === 0
    ? createSources(delayedSource)
    : createSources(delayedSource.pipe(rxStartWith(...initialValues)))
}
