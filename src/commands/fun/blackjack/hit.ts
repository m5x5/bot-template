import { Command } from '../../../core/Command';

export default new Command({
  name: 'BlackJack hit',
  aliases: ['hit'],
  group: 'blackjack',
  guildOnly: true,

  async command(message) {
    message.client.emit<any>('BlackJackHandler:hit', message);
  },
});
