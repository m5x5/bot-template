import { BitFieldResolvable, Message, PermissionString } from 'discord.js';

interface ICommandOptions {
  name: string;
  aliases: string[];
  description?: string;
  guildOnly?: boolean;
  dmOnly?: boolean;
  groupOnly?: boolean;
  channelOnly?: string;
  args?: string[];
  privelagesRequired?: Array<BitFieldResolvable<PermissionString>>;
  group?: string;
  command: (
    message: Message,
    args: string[]
  ) => {} | undefined | void | Promise<{}> | Promise<undefined> | Promise<void>;
  validator?: (
    message: Message,
    args: string[]
  ) => {} | undefined | void | Promise<{}> | Promise<undefined> | Promise<void>;
}

export class Command {
  public constructor(public options: ICommandOptions) {}
}
