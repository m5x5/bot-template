import { Guild, GuildChannel } from "discord.js";
import { message } from "./Message";

const guild = {
  channels: {
    cache: {
      find(filter: any) {
        return message.channel as GuildChannel;
      },
    },
  },
} as Guild;

export default guild;
