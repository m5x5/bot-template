import { Command } from '../../core/Command';

export default new Command({
  aliases: ['bankrob', 'robbank'],
  name: 'Bankrob Command',
  command(message) {
    message.client.emit<any>('bankrob', message);
  },
});
