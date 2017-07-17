import EventEmitter from 'events'

export default check => {
  const event = 'health'
  const emitter = new EventEmitter()
  emitter.setMaxListeners(100)
  return {
    event,
    emitter,
    emit: async (...args) => { emitter.emit(event, await check(...args)) }
  }
}
