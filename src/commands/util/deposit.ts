import { MessageEmbed } from 'discord.js';
import BankAccount from '../../controllers/bankaccount';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';
import Validator from '../../utils/Validator';

export default new Command({
  aliases: ['deposit'],
  name: 'Deposit Money Command',
  async command(message, [money]) {
    const userId = message.author.id;
    const bankAccount = new BankAccount(userId);
    const embed = new MessageEmbed()
      .setTitle(`Deposited ${money} to bank`)
      .setColor('BLUE')
      .setFooter(message.author.username, message.author.avatarURL() || '');

    await bankAccount.deposit(+money);
    return message.channel.send({ embed });
  },
  async validator({ author: { id } }, [money]) {
    Validator.money(money);
    const wallet = await new Wallet(id).forceGet();
    if (wallet.money < +money) {
      throw new Error("You don't have that much money to deposit");
    }
    return new BankAccount(id).forceGet();
  },
});
