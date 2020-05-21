import { MessageEmbed } from 'discord.js';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';
import Selector from '../../utils/Selector';

export default new Command({
  aliases: ['balance', 'wallet', 'mywallet', 'bal', 'money'],
  name: 'Balance Command',
  async command(message) {
    const userId =
      Selector.userFromMessage(message, true)?.id || message.author.id;

    const wallet = await new Wallet(userId).forceGet();
    const embed = new MessageEmbed()
      .setTitle('Balance')
      .setColor('BLUE')
      .setFooter(
        message.author.username,
        message.author.avatarURL() || undefined
      )
      .setDescription(`${wallet?.money}$`);

    return message.channel.send({ embed });
  },
});
