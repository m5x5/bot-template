import { MessageEmbed } from 'discord.js';
import BankAccount from '../../controllers/bankaccount';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';
import Validator from '../../utils/Validator';

export default new Command({
  aliases: ['withdraw'],
  name: 'Remove Money Command',
  async command(message, [money]) {
    const userId = message.author.id;
    const bankAccount = new BankAccount(userId);
    const embed = new MessageEmbed()
      .setTitle(`Withdrawed ${money} from bank`)
      .setColor('BLUE')
      .setFooter(message.author.username, message.author.avatarURL() || '');

    await bankAccount.withdraw(+money);
    return message.channel.send({ embed });
  },
  async validator({ author: { id } }, [money]) {
    Validator.money(money);
    await new Wallet(id).forceGet();
    return new BankAccount(id).forceGet();
  },
});
