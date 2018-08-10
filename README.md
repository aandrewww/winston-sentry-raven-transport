
# winston-raven-sentry
[![CircleCI](https://circleci.com/gh/aandrewww/winston-sentry-raven-transport.svg?style=svg)](https://circleci.com/gh/aandrewww/winston-sentry-raven-transport)
[![node](https://img.shields.io/badge/node-6.4.0+-brightgreen.svg)][node-url]
[![raven](https://img.shields.io/badge/raven-2.x+-brightgreen.svg)][raven-url]
[![winston](https://img.shields.io/badge/winston-3.x+-brightgreen.svg)][winston-url]
[![license](https://img.shields.io/github/license/aandrewww/winston-sentry-raven-transport.svg)][license-url]

[Raven](https://github.com/getsentry/raven-node)/[Sentry](https://sentry.io) transport for the [winston](https://github.com/winstonjs/winston) logger.

## Index

* [Install](#install)
* [Usage](#usage)
* [Options](#options-options)
  - [Default Raven Options](#default-raven-options-optionsconfig)
  - [Default Error Handler](#default-error-handler-optionserrorhandler)
  - [Uncaught Exceptions](#uncaught-exceptions)
  - [Unhandled Promise Rejections](#unhandled-promise-rejections)
  - [Log Level Mapping](#log-level-mapping)
* [License](#license)


## Install

```bash
npm install --save winston winston-sentry-raven-transport
```


## Usage

You can configure `winston-sentry-raven-transport` in two different ways.

With `new winston.Logger`:

```js
const winston = require('winston');
const Sentry = require('winston-sentry-raven-transport');

const options = {
  dsn: 'https://******@sentry.io/12345',
  level: 'info'
};

const logger = new winston.Logger({
  transports: [
    new Sentry(options)
  ]
});
```

Or with winston's `add` method:

```js
const winston = require('winston');
const Sentry = require('winston-sentry-raven-transport');

const logger = new winston.Logger();

logger.add(Sentry, options);
```

See [Options](#options-options) below for custom configuration.

## Options (`options`)

Per `options` variable above, here are the default options provided:

Default Sentry options:

* `dsn` (String) - your Sentry DSN or Data Source Name (defaults to `process.env.SENTRY_DSN`)
* `config` (Object) - a Raven configuration object (see [Default Raven Options](#default-raven-options-optionsconfig) below)
* `install` (Boolean) - automatically catches uncaught exceptions through `Raven.install` if set to true (defaults to `false`)
* `errorHandler` (Function) - a callback function to use for logging Raven errors (e.g. an invalid DSN key).  This defaults to logging the `err.message`, see [Default Error Handler](#default-error-handler-optionserrorhandler) below... but if you wish to disable this just pass `errorHandler: false`. If there is already an `error` listener then this function will not get bound.
* `raven` (Object) - an optional instance of `Raven` that is already configured via `Raven.config` (if provided this will be used instead of the `config` option

Transport related options:

* `name` (String) - transport's name (defaults to `sentry`)
* `silent` (Boolean) - suppress logging (defaults to `false`)
* `level` (String) - transport's level of messages to log (defaults to `info`)
* `levelsMap` (Object) - log level mapping to Sentry (see [Log Level Mapping](#log-level-mapping) below)

### Default Raven Options (`options.config`)

* `logger` (String) - defaults to `winston-raven-sentry`
* `captureUnhandledRejections` (Boolean) - defaults to `false`
* `culprit` (String) - defaults to the module or function name
* `server_name` (String) - defaults to `process.env.SENTRY_NAME` or `os.hostname()`
* `release` (String) - defaults to `process.env.SENTRY_RELEASE`
* `tags` (Array or Object) - no default value
* `environment` (String) - defaults to `process.env.SENTRY_ENVIRONMENT`)
* `modules` (Object) - defaults to `package.json` dependencies
* `extra` (Object) - no default value
* `fingerprint` (Array) - no default value

For a full list of Raven options, please visit <https://docs.sentry.io/clients/node/config/>.

### Default Error Handler (`options.errorHandler`)

The default error handler is a function that is simply:

```js
function errorHandler(err) {
  console.error(err.message);
}
```

... and it is binded to the event emitter:

```js
Raven.on('error', this.options.errorHandler);
```

Therefore if you have specified an invalid DSN key, then you will see its output on the command line.

For example:

```log
raven@2.6.3 alert: failed to send exception to sentry: HTTP Error (401): Invalid api key
```

If you pass `options.errorHandler: false` then no error handler will be binded.

### Uncaught Exceptions

If you want to log uncaught exceptions with Sentry, then specify `install: true` in options:

```js
new Sentry({
  install: true
});
```

### Unhandled Promise Rejections

If you want to log unhandled promise rejections with Sentry, then specify `captureUnhandledRejections: true` in `options.config`:

```js
new Sentry({
  config: {
    captureUnhandledRejections: true
  }
});
```

### Log Level Mapping

Winston logging levels are mapped by default to Sentry's acceptable levels.

These defaults are set as `options.levelsMap' and are:

```js
{
  silly: 'debug',
  verbose: 'debug',
  info: 'info',
  debug: 'debug',
  warn: 'warning',
  error: 'error'
}
```

You can customize how log levels are mapped using the `levelsMap` option:

```js
new Sentry({
  levelsMap: {
    verbose: 'info'
  }
});
```

If no log level mapping was found for the given `level` passed, then it will not log anything.

## License

[MIT License][license-url]


[license-url]: LICENSE
[node-url]: https://nodejs.org
[raven-url]: https://github.com/getsentry/raven-node
[winston-url]: https://github.com/winstonjs/winston
