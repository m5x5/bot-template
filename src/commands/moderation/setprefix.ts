import { MessageEmbed, Permissions } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['setprefix', 'prefixset'],
  guildOnly: true,
  name: 'Set Prefix Command',
  privelagesRequired: [Permissions.FLAGS.MANAGE_GUILD],
  async command({ author, guild, channel, client }, [prefix]) {
    const embed = new MessageEmbed()
      .setTitle(`Prefix set to: ${prefix}`)
      .setColor('GREEN')
      .setFooter(author.username, author.avatarURL() || '');

    client.emit<any>('changeprefix', guild?.id, prefix);
    return channel.send({ embed });
  },
  validator(_message, [prefix]) {
    if (!prefix) {
      throw new Error('Please specify a prefix');
    }
  },
});
