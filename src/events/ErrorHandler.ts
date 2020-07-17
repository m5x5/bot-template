import Bot from "../core/Bot";
import { sendReply } from "../utils";
import { ResponseError } from "../utils/errors";

export default class ErrorHandler {
  constructor(public client: Bot) {
    this.client.on("error", (error: Error | ResponseError) => {
      if (!("userMessage" in error)) throw error;
      return sendReply({
        message: error.message || "Unknown Error",
        channel: error.userMessage.channel,
        type: "error",
      });
    });
  }
}
