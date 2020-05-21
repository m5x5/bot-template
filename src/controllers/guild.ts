import Controller from '../core/Controller';
import GuildModel, { IGuild, IGuildDoc } from '../models/guild';
const guildDebugger = require('debug')('thunder:GuildController');

export default class GuildController extends Controller<IGuildDoc, IGuild> {
  static getGuilds(guildIds: string[]): Promise<IGuild[]> {
    guildDebugger('Retrieving guild data');
    return GuildModel.find({ guildId: { $in: guildIds } })
      .lean()
      .exec();
  }

  constructor(public guildId: string) {
    super(GuildModel, { enabledCommands: [], prefix: '!', guildId });
  }
}
