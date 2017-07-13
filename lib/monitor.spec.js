import test from 'ava'

import createHealthCheck from './check'
import createHealthStats from './stats'
import createHealthMonitor from './monitor'

test('returns health stats for all checks', async t => {
  const checkA = createHealthCheck(x => x, {cache: null})
  const checkB = createHealthCheck(false, {cache: null})

  const monitor = createHealthMonitor({
    a: checkA,
    b: checkB
  })

  const healthFirst = await monitor(true)
  const healthSecond = await monitor(false)

  const statsA = createHealthStats(checkA)
  const statsB = createHealthStats(checkB)

  const [ firstA, firstB ] = await Promise.all([statsA(true), statsB(true)])
  const [ secondA, secondB ] = await Promise.all([statsA(false), statsB(false)])

  t.deepEqual(healthFirst, {
    a: {...firstA, date: healthFirst.a.date, health: healthFirst.a.health},
    b: {...firstB, date: healthFirst.b.date, health: healthFirst.b.health}
  })

  t.deepEqual(healthSecond, {
    a: {...secondA, date: healthSecond.a.date, health: healthSecond.a.health},
    b: {...secondB, date: healthSecond.b.date, health: healthSecond.b.health}
  })
})
