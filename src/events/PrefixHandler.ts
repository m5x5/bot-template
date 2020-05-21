import GuildController from '../controllers/guild';
import Bot from '../core/Bot';
import EventHandler, { IEvents } from '../core/EventHandler';

interface IPrefixEvents extends IEvents {
  change: (guildId: string, prefix: string) => Promise<void>;
  get: (cb: (prefix?: string) => any) => void;
}

export default class PrefixHandler extends EventHandler<IPrefixEvents> {
  constructor(public client: Bot) {
    super(client, 'PrefixHandler');
    this.registerEvent('change', this.change.bind(this));
  }
  async change(guildId: string, prefix: string) {
    await new GuildController(guildId).update('prefix', prefix);
    const guildData = this.client.guildsData.find(
      (guild) => guild.guildId === guildId
    );

    if (!guildData) {
      return;
    }

    guildData.prefix = prefix;
  }
}
