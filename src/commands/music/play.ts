import { Message } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['play', 'playmusic'],
  guildOnly: true,
  name: 'Music Command',
  command(message: Message, args) {
    message.client.emit<any>('MusicHandler:play', message, args.join(' '));
  },
});
