import { Command } from '../../../core/Command';

export default new Command({
  name: 'BlackJack stand',
  aliases: ['stand'],
  group: 'blackjack',
  guildOnly: true,

  async command(message) {
    message.client.emit<any>('BlackJackHandler:stand', message);
  },
});
