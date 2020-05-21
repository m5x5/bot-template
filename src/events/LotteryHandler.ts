import { Message, MessageEmbed, TextChannel } from 'discord.js';
import Wallet from '../controllers/wallet';
import Bot from '../core/Bot';
import EventHandler, { IEvents } from '../core/EventHandler';
import { confirmAction, getRelevantTimeFromMs, sendReply } from '../utils';
import { ONE_HOUR_IN_MS } from '../utils/constants';

const debug = require('debug')('thunder:LotteryHandler');

interface ILotteryEvents extends IEvents {
  buyTicket: (message: Message) => Promise<Message>;
  start: () => Promise<Message> | undefined;
}

export default class LotteryHandler extends EventHandler<ILotteryEvents> {
  playerIds: string[] = [];
  startTime: number = 0;
  lotteryIsActive: boolean = false;
  lotteryChannelId: string =
    process.env.NODE_ENV === 'test'
      ? '705040985918275584'
      : '700274944466223218';
  mainGuildId =
    process.env.NODE_ENV === 'test'
      ? '705033176585601065'
      : '693437592959451156';

  constructor(public client: Bot) {
    super(client, 'LotteryHandler');

    setInterval(this.start.bind(this), ONE_HOUR_IN_MS * 12);
    this.registerEvent('buyTicket', this.buyTicket.bind(this));
    this.registerEvent('start', this.start.bind(this));
  }

  /**
   * This function opens a new joinable lottery
   * @param guild The Message which triggered this event
   */
  start() {
    debug('Lottery started');
    this.lotteryIsActive = true;

    const channel = this.getLotteryChannel();
    const embed = new MessageEmbed()
      .setTitle('Lottery opened :moneybag:')
      .setDescription('Buy tickets to participate :tada:')
      .setColor('PURPLE');

    setTimeout(() => {
      this.lotteryIsActive = false;
      return this.finishAndEvaluateLottery();
    }, ONE_HOUR_IN_MS);

    try {
      this.startTime = Date.now();
      this.playerIds = [];
      return channel?.send(embed);
    } catch (error) {
      sendReply(error, channel, 'error');
    }
  }

  async buyTicket(message: Message) {
    try {
      await this.checkBuyRequirements(message);
      await this.confirmTransaction(message);
      await new Wallet(message.author.id).decrease('money', 100);
      this.playerIds.push(message.author.id);

      const embed = new MessageEmbed()
        .setTitle(`You bought a ticket`)
        .setDescription(
          `Winners will be chosen in ${this.getTimeUntilEnd()} in our [discord server](https://discord.gg/k9PY2pR)`
        )
        .setColor('GREEN');

      return message.channel.send(embed);
    } catch (error) {
      return message.reply(error.message || error);
    }
  }

  async checkBuyRequirements(message: Message) {
    if (!this.lotteryIsActive)
      throw new Error(
        ':thinking: The lottery is not open at the moment. Why would you want to buy a ticket?'
      );
    if (this.playerIds.includes(message.author.id))
      throw new Error('Hold on..., you already have a ticket :joy:');

    if ((await new Wallet(message.author.id).forceGet()).money < 100) {
      throw new Error("You don't have enough money");
    }
  }

  getLotteryChannel(): TextChannel | undefined {
    const channel = this.client.guilds.cache
      .get(this.mainGuildId)
      ?.channels.cache.get(this.lotteryChannelId) as TextChannel;
    return channel;
  }

  confirmTransaction(message: Message) {
    return new Promise((resolve, reject) => {
      return confirmAction(
        {
          confirmationText: 'Are you sure you want to buy a ticket for 100$?',
          message,
        },
        (bool) => {
          if (bool) {
            resolve();
          } else {
            reject('Purchase cancelled.');
          }
        }
      );
    });
  }

  async finishAndEvaluateLottery() {
    const randomPlayer = this.playerIds[Math.floor(Math.random())];
    const channel = this.getLotteryChannel();

    const embed = new MessageEmbed()
      .setTitle('Lottery is over')
      .setDescription(`<@${randomPlayer}> has won 50k`)
      .setColor('PURPLE');

    if (!randomPlayer) {
      embed.setDescription(
        `Nobody won, because nobody took part in the lottery :(`
      );
    }

    if (!channel) {
      throw new Error("The lottery channel specified doesn't exist");
    }

    return Promise.all([
      new Wallet(randomPlayer).increase('money', 50000),
      channel.send({ embed }),
    ]);
  }

  private getTimeUntilEnd() {
    const endTime = this.startTime + ONE_HOUR_IN_MS;
    return getRelevantTimeFromMs(endTime - Date.now());
  }
}
