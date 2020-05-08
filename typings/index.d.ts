import { Message, Guild } from "discord.js";

interface GuildMessage extends Message {
  guild: Guild;
}
