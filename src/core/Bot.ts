import { Client } from "discord.js";
import EventMessagesHandler from "../events/EventHandler";
import MessageHandler from "../events/MessageHandler";
import ErrorHandler from "../events/ErrorHandler";

export default class Bot extends Client {
  initHandlers(): Bot {
    new EventMessagesHandler(this);
    new MessageHandler(this);
    new ErrorHandler(this);
    return this;
  }
}
