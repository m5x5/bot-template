import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['about', 'whoareyou', 'website'],
  name: 'About Command',
  command(message: Message) {
    const embed = new MessageEmbed().setDescription(
      'This bot was created by <@277738577721556994> and <@681261554066653221>.\n For more information or to customize the bot visit the [website](https://google.com)'
    );

    return message.channel.send(embed);
  },
});
