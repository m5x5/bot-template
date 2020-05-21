import { Message } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['repeat', 'repeatmusic'],
  guildOnly: true,
  name: 'Repeat Music Command',
  command(message: Message) {
    message.client.emit<any>('MusicHandler:repeat', message);
  },
});
