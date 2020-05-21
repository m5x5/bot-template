import { Client, ClientOptions } from 'discord.js';
import { join } from 'path';
import GuildController from '../controllers/guild';
import BankrobHandler from '../events/BankrobHandler';
import LotteryHandler from '../events/LotteryHandler';
import MemberHandler from '../events/MemberHandler';
import MessageHandler from '../events/MessageHandler';
import MusicHandler from '../events/MusicHandler';
import PollHandler from '../events/PollHandler';
import PrefixHandler from '../events/PrefixHandler';
import ReactionHandler from '../events/ReactionRoleHandler';
import { IGuildDoc, IGuild } from '../models/guild';
import { readCommandsFrom } from '../utils';
import { Command } from './Command';
import EventHandler, { IEvents } from './EventHandler';

const debug = require('debug')('thunder:bot');

interface IHandlers {
  lottery: LotteryHandler;
  prefix: PrefixHandler;
  [key: string]: EventHandler<IEvents>;
}

export default class Bot extends Client {
  guildIds: string[] = [];
  guildsData: IGuild[] = [];
  handlers?: IHandlers;
  commands?: Command[];

  constructor(options?: ClientOptions) {
    super(options);
    debug('A new bot instance was created');
    this.addHandlers();
  }

  async start(token: string) {
    this.guildIds = this.guilds.cache.map(({ id }) => id);

    debug('Bot is logged in');
    debug({ guildIds: this.guildIds });

    this.setInterval(this.updateGuilds.bind(this), 60000);

    return Promise.all([this.login(token), this.updateGuilds()]);
  }

  async registerCommandsIn(folderName: string, ext?: string) {
    this.commands = (
      await readCommandsFrom(join(__dirname, folderName), ext)
    ).filter((cmd) => !!cmd?.options);
  }

  private addHandlers() {
    this.handlers = {
      bankrob: new BankrobHandler(this),
      lottery: new LotteryHandler(this),
      member: new MemberHandler(this),
      message: new MessageHandler(this),
      music: new MusicHandler(this),
      poll: new PollHandler(this),
      prefix: new PrefixHandler(this),
      reaction: new ReactionHandler(this),
    };
  }

  private async updateGuilds() {
    this.guildsData = await GuildController.getGuilds(this.guildIds);
    this.emit<any>('client:guildData_updated');
  }
}
