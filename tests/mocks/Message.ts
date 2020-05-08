import { GuildMember, Message, MessageEmbed, UserResolvable } from "discord.js";

export let reply: string | undefined;
export let embed: MessageEmbed | undefined;

const guildMember = {
  id: "583044509385309",
  hasPermission(_perm: any) {
    return true;
  },
} as GuildMember;

export let message = {
  author: {
    id: "583044509385309",
  },
  async reply(string: string) {
    reply = string;
    return message;
  },
  channel: {
    send(messageEmbed: MessageEmbed) {
      embed = messageEmbed;
    },
  },
  content: "!setprefix",
  guild: {
    id: "489530485080934",
    members: {
      resolve(_user: UserResolvable) {
        return guildMember;
      },
    },
  },
} as Message;

export function clearResponses() {
  reply = undefined;
  embed = undefined;
}
