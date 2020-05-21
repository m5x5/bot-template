import { Message } from 'discord.js';
import { Command } from '../../core/Command';

export default new Command({
  aliases: ['skip', 'skipmusic'],
  guildOnly: true,
  name: 'Skip Music Command',
  command(message: Message) {
    message.client.emit<any>('MusicHandler:skip', message);
  },
});
