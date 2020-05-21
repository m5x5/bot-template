import { Message } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['queue', 'queuemusic'],
  guildOnly: true,
  name: 'Queue Command',
  command(message: Message) {
    message.client.emit<any>('MusicHandler:queue', message);
  },
});
