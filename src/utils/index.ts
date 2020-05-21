import {
  CollectorFilter,
  DMChannel,
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
} from 'discord.js';
import { join } from 'path';
import { Command } from '../core/Command';
import {
  COLORS,
  ONE_HOUR_IN_MS,
  ONE_MINUTE_IN_MS,
  ONE_SECOND_IN_MS,
} from './constants';

require('dotenv').config();

export function sendReply(
  message: string,
  channel: TextChannel | DMChannel | NewsChannel | null | undefined,
  type: 'info' | 'error' | 'success' = 'info'
) {
  const embed = new MessageEmbed()
    .setColor(COLORS[type])
    .setDescription(message);
  channel?.send(embed);
}

/**
 * This function searches for command files, with the ending .ts or .js
 * @param entryDirectory Path to directory where to find the commands in
 */
export async function readCommandsFrom(
  entryDirectory: string,
  ext?: string
): Promise<Command[]> {
  const commands = [];
  for await (const entry of require('readdirp')(entryDirectory, {
    fileFilter: [ext || '*.js'],
  })) {
    commands.push(require(join(entryDirectory, entry.path)).default);
  }
  return commands;
}

export let getRelevantTimeFromMs = (ms: number) => {
  if (ms <= 0) {
    return '0ms';
  }

  const units = [
    ms / ONE_HOUR_IN_MS,
    ms / ONE_MINUTE_IN_MS,
    ms / ONE_SECOND_IN_MS,
    ms,
  ];
  const unitNames = ['hour', 'minute', 'second', 'ms'];
  const i = units.findIndex((unit) => unit >= 1);
  return (
    Math.ceil(units[i]) + ' ' + unitNames[i] + (units[i] % 1 === 0 ? '' : 's')
  );
};

interface IConfirmTransaction {
  message: Message;
  confirmationText: string;
  timeout?: number;
}

export let confirmAction = async (
  { message, confirmationText }: IConfirmTransaction,
  callback: (bool: boolean) => void
) => {
  const confirmationMessage = await message.reply(confirmationText);
  const possibleReactions: string[] = ['✅', '❌'];
  const filter: CollectorFilter = (reaction, user) =>
    possibleReactions.includes(reaction.emoji.name) &&
    user.id === message.author.id;
  const reactionCollector = confirmationMessage.createReactionCollector(
    filter,
    { time: 15000, max: 1 }
  );

  // tslint:disable-next-line: no-floating-promises
  Promise.all(
    possibleReactions.map((reactionName) =>
      confirmationMessage.react(reactionName)
    )
  );

  reactionCollector.on('collect', (reaction) => {
    if (reaction.emoji.name === '✅') {
      callback(true);
    } else {
      callback(false);
    }
  });
};
