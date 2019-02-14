const winston = require('winston');
const { expect } = require('chai');

const SentryWinston = require('../index.js');

const DSN = '';
const TRANSPORT_NAME = 'winston-sentry-raven';

describe(TRANSPORT_NAME, () => {
  describe('Creating the trasport', () => {
    it('Have default properties when instantiated', () => {
      const sentryWinston = new SentryWinston({ dsn: DSN });

      expect(sentryWinston.name).to.be.equal(TRANSPORT_NAME);
    });

    it('should have a log function', () => {
      const sentryWinston = new SentryWinston({ dsn: DSN });
      expect(typeof sentryWinston.log).to.be.equal('function');
    });

    it('can be registered as winston transport using the add() function', () => {
      const logger = winston.createLogger({
        transports: [],
      });

      logger.add(new SentryWinston({ dsn: DSN }));

      return expect(logger.transports.map(i => i.name)).to.include(TRANSPORT_NAME);
    });

    it('winston.log function should not throw any errors', () => {
      const logger = winston.createLogger({
        transports: [new SentryWinston({ dsn: DSN })],
      });

      expect(() => logger.error('foo')).to.not.throw(Error);
    });
  });
});
