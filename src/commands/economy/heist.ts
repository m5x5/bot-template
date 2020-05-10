import { Command } from '../../core/Command';

export default new Command({
  aliases: ['heist', 'join', 'joinbankrob'],
  name: 'Heist Command',
  command(message) {
    message.client.emit<any>('heist', message);
  },
});
