import { MessageEmbed } from 'discord.js';
import GuildController from '../../controllers/guild';
import { Command } from '../../core/Command';

require('dotenv').config();

export default new Command({
  aliases: ['help'],
  name: 'Help Command',
  async command({ guild, channel }) {
    const { prefix } = await new GuildController(guild?.id || '').forceGet(
      'prefix'
    );
    const commands = `\`\`${prefix}help\`\`
\`\`${prefix}kick\`\`
\`\`${prefix}ban\`\`
\`\`${prefix}setprefix\`\`
`;
    const embed = new MessageEmbed()
      .setTitle('Commands')
      .setDescription(commands)
      .setColor('BLUE');
    return channel.send({ embed });
  },
});
