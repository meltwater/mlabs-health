# Health Monitor

[![npm](https://img.shields.io/badge/npm-%40meltwater%2Fmlabs--health-blue.svg)](https://www.npmjs.com/package/@meltwater/mlabs-health)
[![github](https://img.shields.io/badge/github-repo-blue.svg)](https://github.com/meltwater/mlabs-health)
[![docs](https://img.shields.io/badge/docs-master-green.svg)](https://github.com/meltwater/mlabs-health/tree/master/docs)
[![Codecov](https://img.shields.io/codecov/c/token/rSi1zWW7qN/github/meltwater/mlabs-health.svg)](https://codecov.io/gh/meltwater/mlabs-health)
[![CircleCI](https://circleci.com/gh/meltwater/mlabs-health.svg?style=shield&circle-token=747960c8b18cc596c2afbdf0f3d1fac4ebf8ab37)](https://circleci.com/gh/meltwater/mlabs-health)

## Description

Health monitor for microservices.

## Installation

Add this as a dependency to your project using [yarn] with

```
$ yarn add @meltwater/mlabs-health
```

[yarn]: https://yarnpkg.com/

## Usage

**See the complete [API documentation](./docs).**

This package provides an async function which checks if its argument is true.

```js
import isTrue from '@meltwater/mlabs-health'

const logTrue = async () => {
  const trueValue = await isTrue(true)
  console.log(trueValue)
}

logTrue()
// true
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

### Source Code

The [mlabs-health source] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:meltwater/mlabs-health.git
```

[mlabs-health source]: https://github.com/meltwater/mlabs-health

### Requirements

You will need [Node.js] with [yarn].

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

and set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ yarn
```

[Node.js]: https://nodejs.org/
[nvm]: https://github.com/creationix/nvm

#### CircleCI

The following environment variables must be set on CircleCI:

- `NPM_TOKEN`: npm token for installing and publishing private packages.
- `CODECOV_TOKEN`: Codecov token for uploading coverage reports (optional).

### Tasks

Primary development tasks are defined under `scripts` in `package.json`
and available via `yarn run`.
View them with

```
$ yarn run
```

#### Examples

##### Configuration

Set required and optional configuration options in `examples/local.json`, e.g.,

```json
{
  "logLevel": "debug"
}
```

or override any options with the corresponding environment variable:

  - `LOG_LEVEL` (optional)

##### Running Locally

Run provided examples with, e.g.,

```
$ yarn run example -- is-true | yarn run bunyan
```

or more compactly with, e.g.,

```
$ yarn example is-true | yarn bunyan
```

Pass arguments to examples with

```
$ yarn example is-true false | yarn bunyan
```

In bash or zsh, you may define a convenience function with

```
$ function yrx () { yarn run example $@ | yarn run bunyan; }
```

##### Importing

All examples are included with this package,
create and run one with

```js
import { createExample } from '@meltwater/mlabs-health'

// createExample(exampleName, options)(...args)
createExample('is-true')().catch(err => { console.error(err) })
```

or import them directly with

```js
import { examples } from '@meltwater/mlabs-health'

const isTrue = examples.isTrue()

isTrue().then(data => { console.log(data) }).catch(err => { console.error(err) })
```

#### Production Build

Lint, test, and transpile the production build to `dist` with

```
$ yarn run dist
```

##### Publishing a new release

Release a new version using [`npm version`][npm version].
This will run all tests, update the version number,
create and push a tagged commit,
and trigger CircleCI to publish the new version to npm.

[npm version]: https://docs.npmjs.com/cli/version

#### Linting

Linting against the [JavaScript Standard Style] and [JSON Lint]
is handled by [gulp].

View available commands with

```
$ yarn run gulp -- --tasks
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

Unit testing is handled by [AVA] and coverage is reported by [Istanbul].
Watch and run tests on change with

```
$ yarn run watch:test
```

Generate a coverage report with

```
$ yarn run report
```

An HTML version will be saved in `coverage`.

[AVA]: https://github.com/avajs/ava
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

This npm package is Copyright (c) 2016-2017 Meltwater Group.

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
