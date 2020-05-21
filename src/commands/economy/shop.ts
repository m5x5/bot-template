import { MessageEmbed } from 'discord.js';
import Item from '../../controllers/item';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['shop', 'market', 'supermarket'],
  group: 'economy',
  name: 'Shop Command',
  async command(message) {
    const items = await new Item().getAll();
    const embed = new MessageEmbed()
      .setTitle('Itemshop')
      .setColor('BLUE')
      .setDescription(
        items[0].aliases
          ? items.map((item) => `${item.aliases[0]} costs: ${item.price}\n`)
          : 'There are no items in the shop'
      );

    return message.channel.send({ embed });
  },
});
