import { Guild, GuildChannel, MessageEmbed, TextChannel } from 'discord.js';
import { GuildMessage } from '../../typings';
import Bot from '../core/Bot';
import EventHandler, { IEvents } from '../core/EventHandler';
import { IGuildDoc } from '../models/guild';

export interface IPollHandler extends IEvents {
  create: (message: GuildMessage, content: string) => Promise<any>;
}

export default class PollHandler extends EventHandler<IPollHandler> {
  constructor(public client: Bot) {
    super(client, 'PollHandler');
    this.registerEvent('create', this.create.bind(this));
  }

  private async create(message: GuildMessage, content: string) {
    const guildData = this.getGuildData(message.guild.id);
    const channel = this.getGuildChannel(
      message.guild.id,
      guildData.pollChannel
    );
    const embed = new MessageEmbed()
      .setTitle(content)
      .setAuthor(message.author.username, message.author.avatarURL() || '');
    if (channel?.type !== 'text') {
      return message.reply(
        'Please make sure you setup the poll channel correctly.'
      );
    }

    const pollMessage = await (channel as TextChannel).send(embed);
    await pollMessage.react('👍');
    return Promise.all([pollMessage.react('👎'), message.delete()]);
  }

  private getGuild(guildId: string): Guild {
    return this.client.guilds.cache.get(guildId) as Guild;
  }

  private getGuildData(guildId: string): IGuildDoc {
    return this.client.guildsData.find(
      (guildData) => guildData.guildId === guildId
    ) as IGuildDoc;
  }

  private getGuildChannel(
    guildId: string,
    channelId: string = 'string'
  ): GuildChannel | undefined {
    const guild = this.getGuild(guildId);
    return guild.channels.cache.get(channelId);
  }
}
