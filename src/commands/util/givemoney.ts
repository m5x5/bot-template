import { GuildMember, MessageEmbed } from 'discord.js';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';
import Selector from '../../utils/Selector';
import Validator from '../../utils/Validator';

export default new Command({
  aliases: ['give', 'gift', 'givemoney'],
  name: 'Give Money Command',
  async command(message, [money]) {
    const member = Selector.userFromMessage(message) as GuildMember;

    await new Wallet(message.author.id).decrease('money', +money);
    await new Wallet(member.id).increase('money', +money);

    const embed = new MessageEmbed()
      .setDescription(`Gave ${money} to <@${member.id}>`)
      .setColor('BLUE');
    return message.channel.send({ embed });
  },
  async validator({ author: { id } }, [money]) {
    Validator.money(money);
    const wallet = await new Wallet(id).forceGet();
    if (wallet.money < +money) {
      throw new Error(
        "That's kind, but you can't afford to give away so much money :frowning:"
      );
    }
  },
});
