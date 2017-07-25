// TODO: Instrument logging calls with newrelic.
import createLogger from '@meltwater/mlabs-logger'

export default ({
  healthMonitor,
  log = createLogger({noop: true})
} = {}) => {
  if (healthMonitor == null) throw new Error("Missing 'healthMonitor' instance.")
  for (const [ id, health ] of Object.entries(healthMonitor)) {
    health.observables.status.subscribe(status => {
      const { error } = status
      const level = error === null ? 'info' : 'warn'
      log[level]({
        health: id,
        status: {
          ...status,
          error: error == null ? null : error.toString()
        }}, 'Health: Status')
    })
  }
}
