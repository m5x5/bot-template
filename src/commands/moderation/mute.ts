import { GuildMember, Permissions } from 'discord.js';
import parse from 'parse-duration';
import { Command } from '../../core/Command';
import Selector from '../../utils/Selector';

/**
 * This command allows to mute a guild member.
 */
export default new Command({
  aliases: ['mute'],
  guildOnly: true,
  name: 'Mute User Command',
  privelagesRequired: [Permissions.FLAGS.ADMINISTRATOR],
  async command(message, [_user, duration]) {
    const user = Selector.userFromMessage(message) as GuildMember;

    message.client.emit<any>(
      'MemberHandler:mute',
      message,
      user,
      parse(duration)
    );
  },
});
