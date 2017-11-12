import { createHealthMonitor } from '../lib'

export default ({log}) => async (bars = 1) => {
  const monitor = createHealthMonitor({foo: x => x, bar: x => x}, {cache: null})

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit

  await foo(true)

  let n = 0
  while (n < parseInt(bars)) {
    await bar(true)
    n++
  }

  await foo(true)

  log.debug({status: monitor.health.status()})

  await foo(true)
  await foo(false)
  await foo(true)

  return monitor.health.status()
}
