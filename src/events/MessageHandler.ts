import { Message } from 'discord.js';
import User from '../controllers/user';
import Bot from '../core/Bot';
import { Command } from '../core/Command';
import EventHandler, { IEvents } from '../core/EventHandler';
import { sendReply } from '../utils';

const debug = require('debug')('thunder:MessageHandler');

interface IMessageEvents extends IEvents {
  getCommands: (cb: (commands?: Command[]) => any) => void;
}

export default class MessageHandler extends EventHandler<IMessageEvents> {
  prefix = process.env.PREFIX || '!';

  constructor(client: Bot) {
    super(client, 'MessageHandler');
    client.addListener('commands:get', (callback) => {
      callback(this.client.commands);
    });
    this.registerEvent('getCommands', this.getCommands.bind(this));
    client.on('message', this.message.bind(this));
  }

  async message(message: Message) {
    if (!message.content.startsWith(this.prefix)) return;

    const args = message.content?.trim().split(/ +/g);
    const cmd =
      args?.shift()?.toLowerCase().trim().substring(this.prefix.length) ?? '';
    const command = this.findCommand(cmd);

    if (!command) return this.client.emit<any>('');

    try {
      this.checkCommandConfig(message, command)
      
      if (command.options.validator) {
        await command.options.validator(message, args);
      }

      // "await" ist necessary, otherwise the catch block won't help
      await command.options.command(message, args);
    } catch (error) {
      sendReply(error.message || error, message.channel, 'error');
    }
  }

  getCommands(cb: (commands?: Command[]) => any) {
    cb(this.client.commands);
  }

  /**
   * Check if the options of the single command apply
   * @param message The message to handle
   * @param command The command retrieved from the message
   */
  private checkCommandConfig(
    { guild, author }: Message,
    { options }: Command
  ) {
    const messageAuthor = guild?.members.resolve(author);

    if (options.guildOnly && !guild)
      throw new Error('This is a guild only command');
    if (!messageAuthor && !(author.id === '705038391540056135'))
      throw new Error("The message author isn't on this server");
    if (
      messageAuthor &&
      options.privelagesRequired &&
      !messageAuthor.hasPermission(options.privelagesRequired)
    )
      throw new Error("You haven't the privilages to use this command");
  }

  private findCommand(cmd: string) {
    return this.client.commands?.find(({ options: { aliases } }) =>
      aliases?.includes(cmd)
    );
  }
}
