import { MessageEmbed } from 'discord.js';
import BankAccountController from '../../controllers/bankaccount';
import User from '../../controllers/user';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['profile', 'me', 'showprofile', 'profileshow', 'mirror'],
  name: 'Profile Command',
  async command({ channel, author }) {
    const { items } = await new User(author.id).forceGet();
    const { money } = await new Wallet(author.id).forceGet();
    const bankAccount = await new BankAccountController(author.id).forceGet();

    const embed = new MessageEmbed()
      .setTitle(author.username + "'s Profile")
      .setDescription(items.join('\n'))
      .addField('Money', money + '$')
      .addField('Bank Account', bankAccount?.money + '$');

    return channel.send({ embed });
  },
});
