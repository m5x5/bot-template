import { Message } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['pause', 'pausemusic'],
  guildOnly: true,
  name: 'Pause Music Command',
  command(message: Message) {
    message.client.emit<any>('MusicHandler:pause', message);
  },
});
