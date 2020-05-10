import { MessageEmbed, Permissions } from 'discord.js';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';
import Selector from '../../utils/Selector';
import Validator from '../../utils/Validator';

export default new Command({
  aliases: ['addmoney', 'moneyadd'],
  name: 'Add Money Command',
  privelagesRequired: [Permissions.FLAGS.ADMINISTRATOR],
  async command(message, [money]) {
    const user = Selector.userFromMessage(message);

    await new Wallet(user?.id || message.author.id).increase('money', +money);

    const embed = new MessageEmbed()
      .setDescription(`Added ${money} to wallet`)
      .setColor('BLUE')
      .setFooter(
        message.author.username,
        message.author.avatarURL() || undefined
      );
    return message.channel.send({ embed });
  },
  validator(_message, [money]) {
    Validator.money(money);
  },
});
