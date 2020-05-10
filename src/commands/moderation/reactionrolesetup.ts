import { Command } from '../../core/Command';

export default new Command({
  aliases: ['reactionrolesetup', 'setupreactionroles'],
  guildOnly: true,
  name: 'Reaction Role Setup Command',
  async command(message) {
    message.client.emit<any>('ReactionRole:setup', message);
  },
});
