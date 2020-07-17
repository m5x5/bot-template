import { connect } from "mongoose";
import Bot from "./core/Bot";
import dotenv from "dotenv";
import Debug from "debug";
import { BOT_NAME } from "./utils/constants";

dotenv.config();
const debug = Debug(BOT_NAME);
const { TOKEN, DATABASE, NODE_ENV, TEST_TOKEN, TEST_DATABASE } = process.env;
const token = NODE_ENV === "test" ? TEST_TOKEN : TOKEN;
const dbURI = NODE_ENV === "test" ? TEST_DATABASE : DATABASE;

if (!token) {
  throw new Error("Please provide a token");
} else if (!dbURI) {
  throw new Error("Please provide a connection string");
}

connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() => debug("Connected to db"))
  .catch((err: Error) => debug({ err }));

new Bot().initHandlers().login(token);
