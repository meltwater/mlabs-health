// TODO: Instrument logging calls with newrelic.
import createLogger from '@meltwater/mlabs-logger'

export default ({
  healthMonitor,
  log = createLogger({noop: true})
}) => {
  for (const [ id, health ] of Object.entries(healthMonitor)) {
    health.observables.status.subscribe(status => {
      const { error } = status
      log.info({health: id, status: {
        ...status,
        error: error == null ? null : error.toString()
      }})
    })
  }
}
