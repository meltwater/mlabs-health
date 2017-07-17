import {
  createHealthCheck,
  createHealthEvents,
  createHealthObservables,
  createValueFromObservable
} from '../lib'

export default ({log}) => async () => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const events = createHealthEvents(healthCheck)
  const { status } = createHealthObservables(events)
  const currentStatus = createValueFromObservable(status)
  const { emit } = events

  status.subscribe(status => { log.debug({status}) })

  await emit(true)
  await emit(true)
  await emit(false)

  return currentStatus()
}
