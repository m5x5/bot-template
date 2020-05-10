import { Permissions } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['startlottery', 'openlottery'],
  guildOnly: true,
  name: 'Open Lottery Command',
  privelagesRequired: [Permissions.FLAGS.ADMINISTRATOR],
  command(message) {
    message.client.emit<any>('LotteryHandler:start', message);
  },
});
