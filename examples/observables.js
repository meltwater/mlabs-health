import {
  createHealthCheck,
  createHealthEvents,
  createHealthObservables,
  createValueFromObservable
} from '../index.js'

export default ({ log }) => async () => {
  const healthCheck = createHealthCheck((x) => x, { cache: null })
  const events = createHealthEvents(healthCheck)
  const { status } = createHealthObservables(events)
  const currentStatus = createValueFromObservable(status)

  status.subscribe((status) => {
    log.debug({ status })
  })

  const { emit } = events
  await emit(true)
  await emit(true)
  await emit(false)

  return currentStatus()
}
