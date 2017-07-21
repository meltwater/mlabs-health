import {
  createHealthCheck,
  createHealthMonitor
} from '../lib'

export default ({log}) => async () => {
  const monitor = createHealthMonitor({
    foo: x => x,
    bar: x => x
  }, {createHealthCheck: check => createHealthCheck(check, {cache: null})})

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit

  await foo(true)
  await bar(true)
  await foo(true)

  log.debug({status: monitor.health.status()})

  await foo(true)
  await foo(false)
  await foo(true)

  return monitor.health.status()
}
