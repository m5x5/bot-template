import { Command } from '../../../core/Command';
import Validator from '../../../utils/Validator';
import Wallet from '../../../controllers/wallet';

export default new Command({
  name: 'BlackJack start',
  aliases: ['bj', 'blackjack', 'startbj', 'startblackjack'],
  guildOnly: true,
  async command(message, [bet]) {
    message.client.emit<any>('BlackJackHandler:start', message, +bet);
  },
  async validator(message, [bet]) {
    Validator.money(bet);

    const wallet = await new Wallet(message.author.id).forceGet();

    if (wallet.money < +bet) {
      throw new Error("You don't have enough money to use this command");
    }
  },
});
