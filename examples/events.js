import { createHealthCheck } from '../lib'
import createHealthEmitter from '../lib/events'

export default ({log}) => async () => {
  let go = true
  let healthy = null
  const healthCheck = createHealthCheck(true)
  const { event, emitter, emit } = createHealthEmitter(healthCheck)
  emitter.on(event, health => {
    log.debug({health})
    healthy = health.healthy
    go = false
  })
  await emit()
  while (go) go = true
  return healthy
}
