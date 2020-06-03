import { Message } from 'discord.js';
import { sendReply } from '../utils';
import { EventHandlerError } from '../utils/errors';
import Bot from './Bot';
import { EventEmitter } from 'events';

const debug = require('debug')('thunder:EventHandler');

export interface IEvents {
  [key: string]: (...args: any) => unknown;
}

export default class EventHandler<Events extends IEvents> {
  events = new EventEmitter();
  constructor(public client: Bot, public name?: string) {}

  registerEvent<K extends keyof Events>(eventName: K, func: Events[K]) {
    debug(`Added event: ${this.name || ''}:${eventName}`);
    this.client.addListener(
      `${this.name || ''}:${eventName}`,
      async (...args) => {
        try {
          await func(...args);
        } catch (e) {
          this.error(args[0], e);
        }
      }
    );
  }

  error(argument: any, err: any) {
    if (argument || 'channel' in argument) {
      return sendReply(
        err.message || argument,
        (argument as Message).channel,
        'error'
      );
    }
    throw new EventHandlerError(err.message || err);
  }
}
