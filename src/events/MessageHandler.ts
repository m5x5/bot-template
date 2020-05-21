import { Message } from 'discord.js';
import User from '../controllers/user';
import Bot from '../core/Bot';
import { Command } from '../core/Command';
import EventHandler, { IEvents } from '../core/EventHandler';
import { sendReply } from '../utils';
import { ONE_HOUR_IN_MS } from '../utils/constants';

const debug = require('debug')('thunder:MessageHandler');

interface IMessageEvents extends IEvents {
  getCommands: (cb: (commands?: Command[]) => any) => void;
}

export default class MessageHandler extends EventHandler<IMessageEvents> {
  constructor(client: Bot) {
    super(client, 'MessageHandler');
    client.addListener('commands:get', (callback) => {
      callback(this.client.commands);
    });
    this.registerEvent('getCommands', this.getCommands.bind(this));
    client.on('message', this.handleMessageEvent.bind(this));
  }

  async handleMessageEvent(message: Message) {
    const prefix = this.getGuildPrefix(message.guild?.id) || this.prefix;
    const args = message.content?.trim().split(/ +/g);
    const cmd =
      args?.shift()?.toLowerCase().trim().substring(prefix.length) ?? '';
    const command = this.findCommand(cmd);
    if (!command) return;

    try {
      await this.checkIfOptionsApply(message, command);
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
   * This function checks if the message meets all the specified options
   * @param message The message to handle
   * @param commandFile The mached commandFile
   */
  private async checkIfOptionsApply(message: Message, commandFile: Command) {
    return (
      this.checkIfMessageOptionsApply(message) &&
      this.checkIfGuildOptionsApply(message) &&
      (await this.checkIfCommandOptionsApply(message, commandFile))
    );
  }

  /**
   * Check if the options of the single command apply
   * @param message The message to handle
   * @param command The command retrieved from the message
   */
  private async checkIfCommandOptionsApply(
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

    if (options.group === 'economy' && (await this.isInPrison(author.id)))
      throw new Error(
        "You can't use the economy commands while you're in prison"
      );
    return true;
  }

  private async isInPrison(authorId: string) {
    const user = await new User(authorId).get();

    if (!user?.detentionDate) return false;
    if (user.detentionDate - Date.now() < ONE_HOUR_IN_MS * 3) return true;
    return false;
  }

  private checkIfGuildOptionsApply(message: Message) {
    const guildData = this.client.guildsData.find(
      (guildData) => guildData.guildId == message.guild?.id
    );
    if (!guildData) {
      throw new Error('Make sure you setup the bot on the website first');
    }
    if (
      !guildData.enabledCommands.includes(
        message.content.split('').shift() || ''
      )
    ) {
      return false;
    }
    return true;
  }

  private checkIfMessageOptionsApply(message: Message) {
    const prefix = this.getGuildPrefix(message.guild?.id) || this.prefix;
    return message.content.startsWith(prefix);
  }

  get prefix() {
    return process.env.PREFIX || '!';
  }
  private getGuildPrefix(guildId: string | undefined) {
    return this.client.guildsData.find(
      (guildData) => guildData.guildId === guildId
    )?.prefix;
  }

  private findCommand(cmd: string) {
    return this.client.commands?.find(({ options: { aliases } }) =>
      aliases?.includes(cmd)
    );
  }
}
