import { Message } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['shuffle', 'shufflemusic'],
  guildOnly: true,
  name: 'Shuffle Music Command',
  command(message: Message) {
    message.client.emit<any>('MusicHandler:shuffle', message);
  },
});
