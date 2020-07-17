import { Message } from "discord.js";
import Bot from "../core/Bot";
import { Command } from "../core/Command";
import { sendReply } from "../utils";
import { BOT_NAME, PREFIX } from "../utils/constants";
import Debug from "debug";
import commands from "../commands";

const debug = Debug(BOT_NAME + ":MessageHandler");

export default class MessageHandler {
  commands: Command[] = commands;
  constructor(public client: Bot) {
    client.on("message", this.message.bind(this));
  }

  async message(message: Message): Promise<void> {
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content?.trim().split(/ +/g);
    const cmd =
      args?.shift()?.toLowerCase().trim().substring(PREFIX.length) ?? "";
    const command = this.commands?.find(({ options: { aliases } }) =>
      aliases?.includes(cmd)
    );

    if (!command) return;
    try {
      debug("Command recognized");
      command.checkConfig(message);
      // "await" ist necessary, otherwise errors won't be caught
      await command.options.validator?.(message, args);
      await command.options.run(message, args);
    } catch (error) {
      sendReply({
        message: error.message || error,
        channel: message.channel,
        type: "error",
      });
    }
  }
}
