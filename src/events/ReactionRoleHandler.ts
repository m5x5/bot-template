import {
  Emoji,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  User,
} from 'discord.js';
import { GuildMessage } from '../../typings';
import Bot from '../core/Bot';
import EventHandler, { IEvents } from '../core/EventHandler';
import { sendReply } from '../utils';

const debug = require('debug')('thunder:ReactionHandler');

export interface IReactionEvents extends IEvents {
  setup: (message: GuildMessage) => Promise<void>;
}

export default class ReactionHandler extends EventHandler<IReactionEvents> {
  constructor(public client: Bot) {
    super(client, 'ReactionRole');
    debug('Created a new instance');
    this.registerEvent('setup', this.setup.bind(this));
  }
  /**
   * Adds the unverified role to new user
   * @param member The member which joined the guild
   */
  private async setup(message: GuildMessage) {
    try {
      debug('Started setup');
      const textChannel = await this.getTextChannel(message);
      const emoji = await this.getEmoji(message);
      return this.createReactionRoleMessage(textChannel, emoji);
    } catch (e) {
      sendReply(e.message, message.channel, 'error');
    }
  }

  private async getTextChannel({ channel, author }: Message) {
    const embed = new MessageEmbed()
      .setTitle('Specify the channel name')
      .setDescription(
        'In which channel do you want the reaction role to be in?'
      );
    await channel.send(embed);
    const filter = (m: Message) => m.author.id === author.id;
    const messageCollector = await channel.awaitMessages(filter, {
      max: 1,
      time: 30000,
    });
    const collectedMessage = messageCollector.first();
    if (!collectedMessage) {
      throw new Error('No response received in 30s, setup stopped');
    }
    const reactionChannel = collectedMessage.mentions.channels.first();

    if (reactionChannel?.type !== 'text') {
      throw new Error('Invalid text channel provided');
    }

    return reactionChannel;
  }

  private async getEmoji({ channel, author }: GuildMessage) {
    const embed = new MessageEmbed().setTitle(
      'Please react with the emoji you want to add'
    );

    const message = await channel.send(embed);
    const filter = (_m: Emoji, user: User) => user.id === author.id;
    const emojiCollector = await message.awaitReactions(filter, {
      max: 1,
      time: 30000,
    });
    const collectedEmoji = emojiCollector.first();
    if (!collectedEmoji) {
      throw new Error('No reaction received in 30s, setup stopped');
    }

    return collectedEmoji;
  }

  private async createReactionRoleMessage(
    textChannel: TextChannel,
    { emoji }: MessageReaction
  ) {
    const embed = new MessageEmbed().setTitle(`React with ${emoji} to verify`);

    const message = (await textChannel.send(embed)) as GuildMessage;
    await message.react(emoji);
    const reactionCollector = message.createReactionCollector(
      (reaction) => reaction.emoji.name === emoji.name
    );

    reactionCollector.on('collect', (_: MessageReaction, user: User) =>
      this.addVerifiedRoleToReactor(user, message)
    );
  }

  private async addVerifiedRoleToReactor(user: User, message: GuildMessage) {
    debug('Verifying user');
    let role = message.guild.roles.cache.find((r) => r.name === 'verified');
    if (!role) {
      role = await message.guild.roles.create({
        data: {
          color: 'GREY',
          mentionable: true,
          name: 'verified',
          permissions: ['VIEW_CHANNEL'],
        },
      });
    }

    const guildMember = await message.guild.members.fetch({ user });
    await guildMember.roles.add(role);
  }
}
