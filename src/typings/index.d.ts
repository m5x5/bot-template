import {
  Message,
  Guild,
  ClientEvents,
  TextChannel,
  DMChannel,
  NewsChannel,
  BitFieldResolvable,
  PermissionString,
} from "discord.js";
import { Command } from "../core/Command";
import { IEventDoc } from "../models/event";

//#region Interfaces
export type IEvent = Pick<
  IEventDoc,
  "_id" | "name" | "coach" | "members" | "teams" | "message"
>;

export interface IConfirm {
  message: Message;
  confirmText: string;
  timeout?: number;
}

export interface IChannelInfo {
  guildId: string;
  channelId: string;
}

export interface IMessageInfo extends IChannelInfo {
  messageId: string;
}

export interface GuildMessage extends Message {
  guild: Guild;
}

export interface BotEvents extends ClientEvents {
  reactionRoleLoad: [Message];
}

export interface IMessageContent {
  members?: string[];
  coach?: string;
  teams: string[][];
}

export interface IMessageInfo {
  id?: string;
  event: IMessageContent;
}

export interface IMemberData {
  member: string;
  event: number;
}

export interface IMessageEvents {
  getCommands: (cb: (commands?: Command[]) => unknown) => void;
}

export interface IReplyInfo {
  message: string;
  channel: TextChannel | DMChannel | NewsChannel | null | undefined;
  type?: "info" | "error" | "success";
}

export interface ICommandOptions {
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
  run: (
    message: Message,
    args: string[]
  ) => Promise<void> | void | Promise<unknown> | unknown;
  validator?: (
    message: Message,
    args: string[]
  ) => unknown | void | Promise<unknown> | Promise<void>;
}
//#endregion
