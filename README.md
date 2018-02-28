# Health Monitor

[![npm](https://img.shields.io/badge/npm-%40meltwater%2Fmlabs--health-blue.svg)](https://www.npmjs.com/package/@meltwater/mlabs-health)
[![github](https://img.shields.io/badge/github-repo-blue.svg)](https://github.com/meltwater/mlabs-health)
[![docs](https://img.shields.io/badge/docs-master-green.svg)](https://github.com/meltwater/mlabs-health/tree/master/docs)
[![Codecov](https://img.shields.io/codecov/c/token/rSi1zWW7qN/github/meltwater/mlabs-health.svg)](https://codecov.io/gh/meltwater/mlabs-health)
[![CircleCI](https://circleci.com/gh/meltwater/mlabs-health.svg?style=shield&circle-token=747960c8b18cc596c2afbdf0f3d1fac4ebf8ab37)](https://circleci.com/gh/meltwater/mlabs-health)

## Description

Health monitor for Node microservices.

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install @meltwater/mlabs-health
```

or using [Yarn] with

```
$ yarn add @meltwater/mlabs-health
```

[npm]: https://www.npmjs.com/
[Yarn]: https://yarnpkg.com/

## Usage

**See the complete [API documentation](./docs) and [working examples](./examples).**

Create a health monitor from any supported type,

```js
import { createHealthMonitor  } from '@meltwater/mlabs-health'

const monitor = createHealthMonitor({
  foo: x => x,
  bar: true,
})

const logStatus = async () => {
  await Promise.all([
    monitor.foo.events.emit(true),
    monitor.foo.events.emit(false),
    monitor.bar.events.emit()
  ])

  console.log(monitor.health.status())
}

logStatus().catch(err => { console.log(err) })
```

## Development Quickstart

```
$ git clone https://github.com/meltwater/mlabs-health.git
$ cd mlabs-health
$ nvm install
$ yarn
```

Run each command below in a separate terminal window:

```
$ yarn run watch
$ yarn run watch:test
```

## Development and Testing

### Source code

The [mlabs-health source] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:meltwater/mlabs-health.git
```

[mlabs-health source]: https://github.com/meltwater/mlabs-health

### Requirements

You will need [Node.js] with [npm], [Yarn],
and a [Node.js debugging] client.

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

Set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ yarn
```

[Node.js]: https://nodejs.org/
[Node.js debugging]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/creationix/nvm

#### CircleCI

_CircleCI should already be configured: this section is for reference only._

The following environment variables must be set on [CircleCI]:

- `NPM_TOKEN`: npm token for installing and publishing packages.
- `NPM_TEAM`: npm team to grant read-only package access
  (format `org:team`, optional).
- `CODECOV_TOKEN`: Codecov token for uploading coverage reports (optional).

These may be set manually or by running the script `./circleci/envvars.sh`.

[CircleCI]: https://circleci.com/

### Development tasks

Primary development tasks are defined under `scripts` in `package.json`
and available via `yarn run`.
View them with

```
$ yarn run
```

#### Production build

Lint, test, and transpile the production build to `dist` with

```
$ yarn run dist
```

##### Publishing a new release

Release a new version using [`npm version`][npm version].
This will run all tests, update the version number,
create and push a tagged commit,
and trigger CircleCI to publish the new version to npm.

- **Update the CHANGELOG before each new release after version 1.**
- New versions are released when the commit message is a valid version number.
- Versions are only published on release branches:
  `master` branch or any branch matching `ver/*`.
- If branch protection options are enabled,
  you must first run `npm version` on a separate branch,
  wait for the commit to pass any required checks,
  then merge and push the changes to a release branch.
- **Do not use the GitHub pull request button to merge version commits**
  as the commit tagged with the new version number will not match after merging.

[npm version]: https://docs.npmjs.com/cli/version

#### Examples

**See the [full documentation on using examples](./examples).**

View all examples with

```
$ yarn run example
```

#### Linting

Linting against the [JavaScript Standard Style] and [JSON Lint]
is handled by [gulp].

View available commands with

```
$ yarn run gulp --tasks
```

Run all linters with

```
$ yarn run lint
```

In a separate window, use gulp to watch for changes
and lint JavaScript and JSON files with

```
$ yarn run watch
```

Automatically fix most JavaScript formatting errors with

```
$ yarn run format
```

[gulp]: http://gulpjs.com/
[JavaScript Standard Style]: http://standardjs.com/
[JSON Lint]: https://github.com/zaach/jsonlint

#### Tests

Unit and integration testing is handled by [AVA]
and coverage is reported by [Istanbul] and uploaded to [Codecov].

- Test files end in `.spec.js`.
- Unit tests are placed under `lib` alongside the tested module.
- Integration tests are placed in `test`.
- Static files used in tests are placed in `fixtures`.

Watch and run tests on changes with

```
$ yarn run watch:test
```

If using [AVA snapshot testing], update snapshots with

```
$ yarn run test:update
```

Generate a coverage report with

```
$ yarn run report
```

An HTML version will be saved in `coverage`.

##### Debugging tests

Create a breakpoint by adding the statement `debugger` to the test
and start a debug session with, e.g.,

```
$ yarn run ava:inspect lib/true.spec.js
```

Watch and restart the debugging session on changes with

```
$ yarn run ava:inspect:watch lib/true.spec.js
```

[AVA]: https://github.com/avajs/ava
[AVA snapshot testing]: https://github.com/avajs/ava#snapshot-testing
[Codecov]: https://codecov.io/
[Istanbul]: https://istanbul.js.org/

## Contributing

The author and active contributors may be found in `package.json`,

```
$ jq .author < package.json
$ jq .contributors < package.json
```

To submit a patch:

1. Request repository access by submitting a new issue.
2. Create your feature branch (`git checkout -b my-new-feature`).
3. Make changes and write tests.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin my-new-feature`).
6. Create a new Pull Request.

## License

This npm package is Copyright (c) 2016-2018 Meltwater Group.

## Warranty

This software is provided by the copyright holders and contributors "as is" and
any express or implied warranties, including, but not limited to, the implied
warranties of merchantability and fitness for a particular purpose are
disclaimed. In no event shall the copyright holder or contributors be liable for
any direct, indirect, incidental, special, exemplary, or consequential damages
(including, but not limited to, procurement of substitute goods or services;
loss of use, data, or profits; or business interruption) however caused and on
any theory of liability, whether in contract, strict liability, or tort
(including negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.
