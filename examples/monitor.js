import {
  createHealthCheck,
  createHealthMonitor
} from '../lib'

export default ({log}) => async () => {
  const monitor = createHealthMonitor({
    a: createHealthCheck(x => x, {cache: null}),
    b: createHealthCheck(x => x, {cache: null})
  }, {
    createHealthCheck: x => x
  })

  const a = monitor.a.events.emit
  const b = monitor.b.events.emit

  await a(true)
  await b(true)
  await a(true)

  log.debug({status: monitor.health.status()})

  await a(true)
  await a(false)
  await a(true)

  return monitor.health.status()
}
