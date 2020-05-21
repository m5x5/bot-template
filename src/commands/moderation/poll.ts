import { Message, Permissions } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['poll', 'newpoll', 'startpoll'],
  guildOnly: true,
  name: 'Poll Command',
  privelagesRequired: [Permissions.FLAGS.ADMINISTRATOR],
  command(message: Message, args) {
    if (!args[0]) {
      return message.reply('Please provide the poll message');
    }
    message.client.emit<any>('PollHandler:create', message, args.join(' '));
  },
});
