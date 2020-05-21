import { connect } from 'mongoose';
import Bot from './core/Bot';

require('dotenv').config();

const {
  TOKEN,
  DATABASE,
  NODE_ENV,
  TEST_TOKEN,
  TEST_DATABASE,
} = process.env;
const token = NODE_ENV === "test" ? TEST_TOKEN: TOKEN;
const dbURI = NODE_ENV === "test" ? TEST_DATABASE : DATABASE;
const debug = require("debug")("thunder:index");

if(!token) {
  throw new Error("Please provide a token")
} else if (!dbURI) {
  throw new Error("Please provide a connection string")
}

connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() => debug("Connected to db"))
  .catch((err: Error) => debug({ err }));

const bot = new Bot({});

// tslint:disable-next-line: no-floating-promises
bot.registerCommandsIn('../commands');
// tslint:disable-next-line: no-floating-promises
bot.start(token);
