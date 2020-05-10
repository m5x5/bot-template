import { Message } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['stop', 'stopmusic'],
  guildOnly: true,
  name: 'Stop Music Command',
  command(message: Message) {
    message.client.emit<any>('MusicHandler:stop', message);
  },
});
