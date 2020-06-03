import { MessageEmbed } from 'discord.js';
import { Command } from '../../core/Command';
import Wallet from '../../controllers/wallet';
import Validator from '../../utils/Validator';

export default new Command({
  name: '54 Command',
  guildOnly: true,
  aliases: ['54', 'fiftyfour'],

  async command({ author, member, channel }, [bet]) {
    const randomNumber = Math.ceil(Math.random() * 100);
    const wallet = new Wallet(author.id);
    const cost = +bet;
    const embed = new MessageEmbed()
      .setAuthor(member?.displayName, author?.displayAvatarURL())
      .addField('You Rolled', randomNumber, true);

    if (randomNumber <= 54) {
      embed
        .setDescription(
          `Bad luck ${author}! You lost ${cost}. Better luck next time`
        )
        .setColor('RED');
      await wallet.decrease('money', cost);
    } else {
      embed
        .setDescription(
          `Congratulation ${author}! You have won additional ${cost}`
        )
        .setColor('GREEN');
      await wallet?.increase('money', cost * 0.9);
    }

    return channel.send(embed);
  },

  async validator(message, [amount]) {
    if (+amount < 100000) throw new Error(`Minimum amount of betting is 100k`);
    Validator.money(amount);

    const wallet = await new Wallet(message.author.id).forceGet();

    if (wallet.money < +amount) {
      throw new Error("You don't have enough money to use this command");
    }
  },
});
