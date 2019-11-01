const {
  defaults,
  defaultsDeep,
  isFunction,
  omit,
  has,
} = require('lodash');
const Raven = require('raven');
const TransportStream = require('winston-transport');

function errorHandler(err) {
  console.error(err);
}

class Sentry extends TransportStream {
  constructor(opts = {}) {
    super(opts);
    this.name = 'winston-sentry-raven';
    const options = Object.assign({}, opts);

    defaultsDeep(options, {
      dsn: process.env.SENTRY_DSN || '',
      config: {
        logger: 'winston-sentry-raven',
        captureUnhandledRejections: false,
      },
      errorHandler,
      install: false,
      name: 'winston-sentry-raven',
      silent: false,
      level: 'info',
      levelsMap: {
        silly: 'debug',
        verbose: 'debug',
        info: 'info',
        debug: 'debug',
        warn: 'warning',
        error: 'error',
      },
    });

    this.levelsMap = options.levelsMap;

    if (options.tags) {
      options.config.tags = options.tags;
    } else if (options.globalTags) {
      options.config.tags = options.globalTags;
    }

    if (options.extra) {
      options.config.extra = options.config.extra || {};
      options.config.extra = defaults(options.config.extra, options.extra);
    }

    // expose the instance on the transport
    this.raven = options.raven || Raven.config(options.dsn, options.config);

    if (isFunction(options.errorHandler) && this.raven.listeners('error').length === 0) {
      this.raven.on('error', options.errorHandler);
    }

    // it automatically will detect if it's already installed
    if (options.install || options.patchGlobal) {
      this.raven.install();
    }
  }

  log(info, callback) {
    const { message, stack, level, } = info;

    const meta = Object.assign({}, omit(info, ['level', 'message', 'stack', 'label']));
    setImmediate(() => {
      this.emit('logged', level);
    });

    if (this.silent) return callback(null, true);

    if (!has(this.levelsMap, level)) {
      return callback(null, true);
    }

    const context = {};
    context.level = this.levelsMap[level];
    context.extra = meta;

    if (context.level === 'error' || context.level === 'fatal') {
      let exception = message;
      if (stack) {
        exception = new Error(message);
        exception.stack = stack;
      }

      return this.raven.captureException(exception, context, () => {
        callback(null, true);
      });
    }

    return this.raven.captureMessage(message, context, () => {
      callback(null, true);
    });
  }
}

module.exports = Sentry;
