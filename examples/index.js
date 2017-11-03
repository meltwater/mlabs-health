import 'source-map-support/register'

import path from 'path'

import createExamples from '@meltwater/examplr'

import check from './check'
import events from './events'
import monitor from './monitor'
import observables from './observables'

const examples = {
  check,
  events,
  monitor,
  observables
}

const envVars = [
  'LOG_LEVEL',
  'LOG_OUTPUT_MODE'
]

const defaultOptions = {}

if (require.main === module) {
  const { runExample } = createExamples({
    examples,
    envVars,
    defaultOptions
  })

  runExample({
    local: path.resolve(__dirname, 'local.json')
  })
}
