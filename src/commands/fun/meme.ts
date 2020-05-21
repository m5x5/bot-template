import { MessageEmbed } from 'discord.js';
import { memeAsync } from 'memejs';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['meme', 'showmeme'],
  name: 'Meme Command',
  async command({ channel }, subredditNameArray) {
    const embed = new MessageEmbed();
    const subreddit =
      subredditNameArray.join(' ').length < 1
        ? 'dankmemes'
        : subredditNameArray;
    // tslint:disable-next-line: no-floating-promises
    channel.startTyping();
    const [imageData] = await Promise.all([memeAsync(subreddit)]);
    channel.stopTyping(true);

    embed.setImage(imageData.url).setFooter(imageData.author);
    return channel.send(embed);
  },
});
