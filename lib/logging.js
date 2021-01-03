import { createLogger } from '@meltwater/mlabs-logger'
import { toPairs } from '@meltwater/phi'

export default ({
  healthMonitor,
  log = createLogger({ name: 'health' })
} = {}) => {
  if (healthMonitor == null) {
    throw new Error("Missing 'healthMonitor' instance.")
  }
  for (const [id, health] of toPairs(healthMonitor)) {
    health.observables.status.subscribe((status) => {
      const { error } = status
      const level = error === null ? 'info' : 'warn'
      log[level](
        {
          health: id,
          status: {
            ...status,
            error: error == null ? null : error.toString()
          }
        },
        'Health: Status'
      )
    })
  }
}
