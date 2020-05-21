import { MessageEmbed } from 'discord.js';
import Wallet from '../../controllers/wallet';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['rob'],
  name: 'Rob Command',
  async command({ channel, author }) {
    const authorWallet = new Wallet(author.id);
    const randomWallet = await authorWallet.getRandomWallet();
    const loot = Math.ceil(randomWallet.money * 0.75);
    const embed = new MessageEmbed()
      .setTitle(`Robbed ${loot}$ from a random player`)
      .setColor('BLUE')
      .setFooter(author.username, author.avatarURL() || '');

    await new Wallet(randomWallet.userId).decrease('money', loot);
    await authorWallet.increase('money', loot);
    return channel.send({ embed });
  },
});
