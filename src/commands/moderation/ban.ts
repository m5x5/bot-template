import { MessageEmbed, Permissions } from 'discord.js';
import { Command } from '../../core/Command';
import { sendReply } from '../../utils';

export default new Command({
  aliases: ['ban', 'Ban'],
  guildOnly: true,
  name: 'Ban Command',
  privelagesRequired: [Permissions.FLAGS.BAN_MEMBERS],
  async command(message) {
    const target = message.guild?.members.resolve(
      message.mentions.users.first()?.id || ''
    );

    if (!target) {
      return sendReply("This user doesn't exists", message.channel, 'info');
    } else if (!target.kickable) {
      return sendReply("This user isn't bannable", message.channel, 'info');
    }

    await target.ban();
    const embed = new MessageEmbed().setTitle('User Banned').setColor('BLUE');
    await message.channel.send({ embed });
  },
});
