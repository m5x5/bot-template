import { Message, MessageEmbed } from 'discord.js';
import SuggestionController from '../../controllers/suggestion';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['suggest', 'suggestion'],
  name: 'Suggest Command',
  command(message: Message, suggestionArray) {
    const embed = new MessageEmbed()
      .setDescription(
        'Thank you for your suggestion, we are going to try our best to consider add it with the next release'
      )
      .setColor('GREEN');
    return Promise.all([
      new SuggestionController(
        suggestionArray.join(' '),
        message.author.id
      ).create(),
      message.channel.send(embed),
    ]);
  },
  validator(_message, [suggestion]) {
    if (!suggestion) {
      throw new Error('Please provide a suggestion as second argument');
    }
  },
});
