import { Message } from "discord.js";

export class EventHandlerError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'EventHandlerError';
  }
}

export class ResponseError extends Error {
  constructor(public message: string, public userMessage: Message) {
    super(message);
    this.name = 'ResponseError';
  }
}