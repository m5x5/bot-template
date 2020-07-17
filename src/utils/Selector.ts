import { GuildMember, Message } from "discord.js";

export default class Selector {
  static userFromMessage(
    message: Message,
    optional?: boolean
  ): GuildMember | undefined {
    const { mentions, guild } = message;
    const target = guild?.members.resolve(mentions.users.first()?.id || "");

    if (!target && !optional) {
      throw new Error("This user doesn't exist");
    } else if (!target) {
      return;
    } else {
      return target;
    }
  }
}
