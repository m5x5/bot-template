import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';
import Selector from '../../utils/Selector';
import Validator from '../../utils/Validator';

export default new Command({
  aliases: ['removemoney', 'moneyremove'],
  name: 'Remove Money Command',
  privelagesRequired: [Permissions.FLAGS.ADMINISTRATOR],
  async command(message, [money]) {
    const user = Selector.userFromMessage(message) as GuildMember;
    const embed = new MessageEmbed()
      .setTitle(`Removed ${money} from wallet`)
      .setColor('BLUE')
      .setFooter(
        message.author.username,
        message.author.avatarURL() || undefined
      );
    const userWallet = new Wallet(user.id);
    const hasWallet = userWallet.exists();

    if (!hasWallet) {
      throw new Error('You have no money');
    }

    await userWallet.decrease('money', +money);
    return message.channel.send({ embed });
  },
  async validator(_message, [money]) {
    Validator.money(money);
  },
});
