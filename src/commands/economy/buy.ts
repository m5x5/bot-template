import { MessageEmbed } from 'discord.js';
import User from '../../controllers/user';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['buy'],
  name: 'Buy Item Command',
  async command(message, [item]) {
    const { price } = await new User(message.author.id).buyItem(item);
    const embed = new MessageEmbed()
      .setTitle(`You bought${item} from the store for ${price}dollar`)
      .setColor('GREEN');
    return message.channel.send({ embed });
  },
  async validator(_message, item) {
    if (!item) {
      throw new Error('Please specify the item you want to by');
    }
  },
});
