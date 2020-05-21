import {
  GuildMember,
  MessageEmbed,
  PartialGuildMember,
  Role,
  TextChannel,
} from 'discord.js';
import { GuildMessage } from '../../typings';
import Bot from '../core/Bot';
import EventHandler, { IEvents } from '../core/EventHandler';
import { IGuildDoc } from '../models/guild';
import { MUTE_ROLE_OPTIONS } from '../utils/constants';
const debug = require('debug')('thunder:MemberHandler');

interface IMemberHandlerEvents extends IEvents {
  mute: (
    message: GuildMessage,
    user: GuildMember,
    duration?: number
  ) => Promise<any>;
}
export default class MemberHandler extends EventHandler<IMemberHandlerEvents> {
  constructor(public client: Bot) {
    super(client, 'MemberHandler');

    client.on('guildMemberAdd', (member) =>
      this.guildMemberAddOrRemove(member, 'add')
    );
    client.on('guildMemberRemove', (member) =>
      this.guildMemberAddOrRemove(member, 'remove')
    );
    this.registerEvent('mute', this.muteUser.bind(this));
  }

  private guildMemberAddOrRemove(
    member: GuildMember | PartialGuildMember,
    type: 'add' | 'remove'
  ) {
    debug(
      `${member.displayName} joined or left the ${member.guild.name} guild`
    );
    const message =
      type === 'add'
        ? `Welcome to the server <@${member.id}>`
        : `@${member.displayName} just left the server`;
    const channel = this.getGuildChannel(this.getGuild(member.guild.id), type);
    if (channel?.type !== 'text') {
      return;
    }
    return (channel as TextChannel).send(message);
  }
  private getGuild(guildId: string) {
    return this.client.guildsData.find(
      (guildData) => guildData.guildId === guildId
    ) as IGuildDoc;
  }
  private getGuildChannel(guildData: IGuildDoc, type: 'add' | 'remove') {
    const channelId =
      type === 'add' ? guildData.welcomeChannel : guildData.leaveChannel;
    const guild = this.client.guilds.cache.get(guildData.guildId);
    const channel = guild?.channels.cache.get(channelId || '');
    return channel;
  }

  private async muteUser(
    message: GuildMessage,
    user: GuildMember,
    duration?: number
  ) {
    const embed = new MessageEmbed()
      .setTitle('Member muted successfully!')
      .setColor('RED');

    let muteRole = message.guild.roles.cache.find(
      (role) => role.name === 'muted'
    );
    if (!muteRole) {
      muteRole = await message.guild.roles.create(MUTE_ROLE_OPTIONS);
    }

    if (duration) {
      this.unmuteUserAfterDuration(user, duration, muteRole);
    }
    return Promise.all([user.roles.add(muteRole), message.channel.send(embed)]);
  }

  private unmuteUserAfterDuration(
    user: GuildMember,
    duration: number,
    muteRole: Role
  ) {
    setTimeout(() => {
      return user.roles.remove(muteRole);
    }, duration);
  }
}
