import { MessageEmbed, Permissions } from 'discord.js';
import { Command } from '../../core/Command';
import { sendReply } from '../../utils';

export default new Command({
  aliases: ['kick', 'Kick'],
  guildOnly: true,
  name: 'Kick Command',
  privelagesRequired: [Permissions.FLAGS.KICK_MEMBERS],
  async command(message) {
    const target = message.guild?.members.resolve(
      message.mentions.users.first()?.id || ''
    );

    if (!target) {
      return sendReply("This user doesn't exists", message.channel, 'error');
    } else if (!target.kickable) {
      return sendReply("This user isn't kickable", message.channel, 'error');
    }

    await target.kick();
    const embed = new MessageEmbed().setTitle('User Kicked').setColor('BLUE');
    return message.channel.send({ embed });
  },
});
