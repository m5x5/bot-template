import { Command } from '../../../core/Command';

export default new Command({
  name: 'BlackJack double',
  aliases: ['double'],
  group: 'blackjack',
  guildOnly: true,

  async command(message) {
    message.client.emit<any>('BlackJackHandler:double', message);
  },
});
