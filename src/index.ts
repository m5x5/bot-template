import { connect } from 'mongoose';
import Bot from './core/Bot';

require('dotenv').config();

const {
  TOKEN,
  NODE_ENV,
  THUNDER_TEST_TOKEN,
  TEST_DATABASE,
  DATABASE,
} = process.env;
const token = NODE_ENV === 'test' ? THUNDER_TEST_TOKEN || '' : TOKEN || '';
const dbURI = NODE_ENV === 'test' ? TEST_DATABASE : DATABASE;
const indexDebugger = require('debug')('thunder:index');

connect(dbURI || 'mongodb://localhost/thunder-bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => indexDebugger('Connected to db'))
  .catch((err: Error) => indexDebugger({ err }));

const bot = new Bot({});

// tslint:disable-next-line: no-floating-promises
bot.registerCommandsIn('../commands');
// tslint:disable-next-line: no-floating-promises
bot.start(token);
