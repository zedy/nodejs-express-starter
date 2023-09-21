// imports
import { format, createLogger, transports } from 'winston';

const {
  combine,
  timestamp,
  label,
  printf,
} = format;

const myFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, message, label, timestamp,
}) => `${timestamp} [${label}] ${level}: ${message}`);

// message.split('\n', 2).join('')

const logger = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'Cinch-logger' }),
    timestamp({
      format: 'DD-MMM-YYYY | HH:mm:ss',
    }),
    myFormat,
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
