import { Message, MessageEmbed } from 'discord.js';
import { GuildMessage } from '../../typings';
import BankAccount from '../controllers/bankaccount';
import UserController from '../controllers/user';
import Wallet from '../controllers/wallet';
import Bot from '../core/Bot';
import EventHandler, { IEvents } from '../core/EventHandler';
import { getRelevantTimeFromMs, sendReply } from '../utils';
import { TWELVE_HOURS_IN_MS } from '../utils/constants';

interface IBankrob {
  channelId: string;
  robberIds: string[];
}

interface IBankrobEvents extends IEvents {
  heist: (message: Message) => Promise<void>;
  start: (message: GuildMessage) => Promise<void>;
}

export default class BankrobHandler extends EventHandler<IBankrobEvents> {
  currentBankrobs: Map<string, IBankrob> = new Map();

  constructor(public client: Bot) {
    super(client, 'BankrobHandler');

    this.registerEvent('heist', this.heist.bind(this));
    this.registerEvent('start', this.start.bind(this));
  }

  async start(message: Message) {
    const embed = new MessageEmbed()
      .setTitle('Bankrob started :moneybag:')
      .setDescription('Enter the bankrob with the ``!heist`` command')
      .setColor('PURPLE')
      .setFooter(message.author.username, message.author.avatarURL() || '');

    try {
      await this.checkRequirements(message, { newBankrob: true });
      this.currentBankrobs.set(message.guild?.id as string, {
        channelId: message.channel.id,
        robberIds: [message.author.id],
      });
      await message.channel.send({ embed });
    } catch (error) {
      sendReply(error, message.channel, 'error');
    }
  }

  async heist(message: Message) {
    try {
      const promises = [
        this.checkJoinRequirements(message),
        this.checkRequirements(message),
      ];

      await Promise.all(promises);
      sendReply(
        'You successfully joined the bankrob',
        message.channel,
        'error'
      );
    } catch (error) {
      sendReply(error, message.channel, 'error');
    }
  }

  private async checkRequirements(
    { author: { id }, guild }: Message,
    options?: { newBankrob?: boolean }
  ) {
    const [{ lastBankrob }, { money }] = await Promise.all([
      new UserController(id).forceGet(),
      new Wallet(id).forceGet('money'),
    ]);
    if (options?.newBankrob && this.currentBankrobs.get(guild?.id as string)) {
      throw new Error(
        'There is an active bankrob already, write ``!heist`` to join'
      );
    } else if (!(money >= 2000)) {
      throw new Error("You don't have enough money");
    }
    await new Wallet(id).decrease('money', 2000);

    if (lastBankrob > Date.now() - TWELVE_HOURS_IN_MS) {
      throw new Error(
        'You have to wait for ' +
          getRelevantTimeFromMs(Date.now() - TWELVE_HOURS_IN_MS) +
          ' to start a new bankrob'
      );
    }
  }

  private async checkJoinRequirements(message: Message) {
    if (!message.guild) {
      throw new Error('Please use this command in a guild');
    }

    const bankrob = this.currentBankrobs.get(message.guild.id);

    if (!bankrob) {
      throw new Error('Create a new bankrob using ``!bankrob``');
    } else if (bankrob.robberIds.includes(message.author.id)) {
      throw new Error('You are already participating in the active bankrob.');
    }

    bankrob.robberIds.push(message.author.id);

    if (bankrob.robberIds.length === 5) {
      this.currentBankrobs.delete(message.guild.id);
      return this.endGame(message, bankrob);
    }
  }

  private async endGame(message: Message, bankrob: IBankrob) {
    if (this.robbersWon(bankrob.robberIds)) {
      await this.handleSuccess(message, bankrob);
    } else {
      await this.handleFailure(message, bankrob);
    }
    message.channel.stopTyping();
  }

  private detendRobbers(robberIds: string[]): Array<Promise<void>> {
    return robberIds.map((robberId) => {
      return new UserController(robberId).update('detentionDate', Date.now());
    });
  }

  private async handleSuccess(message: Message, { robberIds }: IBankrob) {
    const [loot] = await Promise.all([
      new BankAccount('').robBank(robberIds),
      message.channel.startTyping(),
    ]);

    const embed = new MessageEmbed()
      .setTitle('Bankrob is over')
      .setDescription(`<@${robberIds.join('>, <@')}> have looted ${loot}€`)
      .setColor('PURPLE');

    return Promise.all([
      this.dispatchLoot(loot, robberIds),
      message.channel.send({ embed }),
    ]);
  }

  private async handleFailure(message: Message, { robberIds }: IBankrob) {
    const embed = new MessageEmbed()
      .setTitle('Bankrob failed')
      .setDescription(
        `<@${robberIds.join(
          '>, <@'
        )}> have failed, this means they'll have to go to prison for 3 hours`
      )
      .setColor('PURPLE');

    return Promise.all([
      this.detendRobbers(robberIds),
      message.channel.send({ embed }),
    ]);
  }

  private robbersWon(robberIds: string[]): boolean {
    let probability = 0.2;
    for (let i = 1; i < robberIds.length; i++) {
      probability += 0.1;
    }
    const randomNumber = Math.random();

    return randomNumber < probability;
  }

  /**
   * This function dispatches the loot among the robbers
   * The robber who started the game gets twice the amount the average robber gets.
   * @param loot The total loot the robbers received from the bankrob
   * @param robberIds The discord ids from the robbers, starting with the robber who started the game
   */
  private async dispatchLoot(loot: number, robberIds: string[]) {
    const robbersCount = robberIds.length;
    const averageLoot = Math.floor(loot / (robbersCount + 1));

    return Promise.all(this.addToWallets(robberIds, averageLoot));
  }

  /**
   * This function adds the loot to the specific bank account
   * @param robberIds The discord ids from the robbers, starting with the robber who started the game
   * @param averageLoot The average loot a robber receives
   */
  private addToWallets(
    robberIds: string[],
    averageLoot: number
  ): Array<Promise<void>> {
    return robberIds.map((robberId, index) => {
      return new BankAccount(robberId).increase(
        'money',
        index === 0 ? averageLoot * 2 : averageLoot
      );
    });
  }
}
