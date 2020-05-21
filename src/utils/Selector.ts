import { Message } from 'discord.js';

export default class Selector {
  static userFromMessage({ mentions, guild }: Message, optional?: boolean) {
    const target = guild?.members.resolve(mentions.users.first()?.id || '');

    if (!target && !optional) {
      throw new Error("This user doesn't exist");
    } else if (!target) {
      return;
    } else {
      return target;
    }
  }
}
