import EventEmitter from 'events'

export default (check) => {
  const event = 'health'
  const emitter = new EventEmitter()
  const emit = async (...args) => {
    const data = await check(...args)
    emitter.emit(event, data)
  }
  return { event, emitter, emit }
}
