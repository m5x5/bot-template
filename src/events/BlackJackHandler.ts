import EventHandler, { IEvents } from '../core/EventHandler';
import Bot from '../core/Bot';
import { MessageEmbed, Message, TextBasedChannelFields } from 'discord.js';
import Wallet from '../controllers/wallet';
import { GuildMessage } from '../../typings';

const debug = require('debug')('thunder:BlackJackHandler');
const currentGames:Map<string, BlackJackGame> =new Map()

interface IBlackJackEvents extends IEvents {}

interface IBlackJackConfig {
  bet: number;
  playerWallet: Wallet;
  message: GuildMessage;
}

export default class BlackJackHandler extends EventHandler<IBlackJackEvents> {
  private games: Map<string, BlackJackGame> = new Map();

  constructor(client: Bot) {
    super(client, 'BlackJackHandler');

    this.registerEvent('start', this.start.bind(this));
    this.registerEvent('double', this.double.bind(this));
    this.registerEvent('hit', this.hit.bind(this));
    this.registerEvent('stand', this.stand.bind(this));
  }

  async start(message: GuildMessage, bet: number) {
    if (currentGames.has(message.author.id))
      throw new Error('Please finish your first game first');
    debug('Game started');

    const playerWallet = new Wallet(message.author.id);

    currentGames.set(
      message.author.id,
      new BlackJackGame({ bet, playerWallet, message })
    );
  }

  async hit(message: GuildMessage) {
    const game = currentGames.get(message.author.id);
    if (!game) return false;

    message.delete({ reason: 'Message has been read' });

    game.hit();
  }

  async double(message: GuildMessage) {
    currentGames.get(message.author.id)?.double(message);
  }

  async stand(message: GuildMessage) {
    currentGames.get(message.author.id)?.end(message);
  }

  end(playerId: string) {
    currentGames.delete(playerId);
  }
}

class BlackJackGame {
  bet: number;
  doubled: boolean = false;
  playerWallet: Wallet;
  extra?: number;
  playerCards: number[] = [];
  dealerCards: number[] = [];
  botMessage?: Message;
  message: GuildMessage;
  private deck: Array<number> = [];
  private cardEmotes = [
    'blackjack_0',
    'blackjack_a',
    'blackjack_2',
    'blackjack_3',
    'blackjack_4',
    'blackjack_5',
    'blackjack_6',
    'blackjack_7',
    'blackjack_8',
    'blackjack_9',
    'blackjack_10',
    'blackjack_j',
    'blackjack_q',
    'blackjack_k',
  ];

  constructor(config: IBlackJackConfig) {
    debug('Game started');
    const { bet, playerWallet, message } = config;

    this.bet = bet;
    this.playerWallet = playerWallet;
    this.message = message;

    this.pullCardFor('dealer');
    this.pullCardFor('dealer');
    this.pullCardFor('player');
    this.pullCardFor('player');

    playerWallet.decrease('money', this.bet);

    if (this.playerScore >= 21) {
      this.end(message);
    } else {
      this.updateMessage(message);
    }
  }

  async hit() {
    this.doubled = true;

    this.pullCardFor('player');

    if (this.playerScore >= 21) {
      this.end(this.message);
    } else {
      this.dealerPlay(this.message);
    }
  }

  async end(message: GuildMessage) {
    debug('Game ended');

    if (this.playerScore === 21)
      while (this.dealerScore <= 21) this.pullCardFor('dealer');
    while (this.dealerScore < 17) this.pullCardFor('dealer');

    const result = this.getResult();

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor('VIOLET')
      .addField('Dealer Cards', this.drawCards(this.dealerCards))
      .addField('Dealer Score', this.dealerScore)
      .addField('Your Cards', this.drawCards(this.playerCards))
      .addField('Your Score', this.playerScore)
      .addField('Your Bet', `${this.bet + (this.extra || 0)} gold`)
      .setTitle(await this.chooseTitle(result));

    if (result === 'won') {
      await this.playerWallet.increase(
        'money',
        (this.extra || 0) + this.bet * 2
      );
    }

    await this.show(embed, message.channel);

    currentGames.delete(message.author.id)
  }

  async double(message: GuildMessage) {
    if (this.playerScore >= 21) return this.end(message);

    this.doubled = true;
    this.extra = this.bet;
    this.pullCardFor('player');

    return Promise.all([
      this.playerWallet.decrease('money', this.bet),
      this.end(message),
    ]);
  }

  // if (!userAction) {
  //   currentGames.delete(message.author.id);
  //   await this.wallet.decrease('money', this.extra + bet);
  //   throw new Error('Game timed out and ended ' + message.author);

  private calcScore(cards: number[] = []) {
    let aces = 0;
    let endScore = 0;

    for (const card of cards) {
      if (card === 1 && aces === 0) {
        aces++;
      } else {
        endScore += card >= 10 ? 10 : card;
      }
    }

    if (aces == 1) {
      if (endScore + 11 > 21) {
        endScore++;
      } else {
        endScore += 11;
      }
    }
    return endScore;
  }

  get playerScore() {
    return this.calcScore(this.playerCards);
  }

  get dealerScore() {
    return this.calcScore(this.dealerCards);
  }

  private pullCardFor(playerNum: 'dealer' | 'player') {
    let keepGoing = true;
    let cardPull = 0;

    if (this.deck.length >= 52) return;
    while (keepGoing) {
      cardPull = Math.floor(Math.random() * 52 + 1);
      keepGoing = false;

      for (let card of this.deck) {
        if (cardPull === card) {
          keepGoing = true;
        }
      }
    }

    this.deck.push(cardPull);

    if (cardPull <= 13) {
    } else if (cardPull <= 26) {
      cardPull -= 13;
    } else if (cardPull <= 39) {
      cardPull -= 26;
    } else if (cardPull <= 52) {
      cardPull -= 39;
    }

    if (playerNum === 'dealer') {
      this.dealerCards.push(cardPull);
    } else {
      this.playerCards.push(cardPull);
    }
  }

  private dealerPlay(message: GuildMessage) {
    while (this.dealerScore < 17) {
      this.pullCardFor('dealer');
    }

    if (this.dealerScore > 21) return this.end(message);
  }

  private drawCards(cards: Array<number>): string {
    let cardsElem: string = '';
    if (cards.length == 1) cardsElem += this.getEmoji(0);

    for (let card of cards) {
      cardsElem += this.getEmoji(card);
    }

    return cardsElem;
  }

  private getEmoji(cardNum: number) {
    if (!this.cardEmotes[cardNum]) {
      return cardNum;
    } else {
      return `:${this.cardEmotes[cardNum]}:`;
    }
  }

  private async updateMessage(message: GuildMessage) {
    const messageElem = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor('VIOLET')
      .addField('Dealer Cards', this.drawCards(this.dealerCards.slice(1, 2)))
      .addField('Dealer Score', '--')
      .addField('Your Cards', this.drawCards(this.playerCards))
      .addField('Your Score', this.playerScore);

    if (this.botMessage) {
      await this.botMessage.edit(messageElem);
    } else {
      this.botMessage = await message.channel.send({ embed: messageElem });
    }
  }

  private async chooseTitle(status: 'busted' | 'won' | 'push' | 'lost') {
    const titles = {
      busted: 'YOU BUSTED!',
      won: 'YOU WIN!',
      push: 'PUSH! $' + this.bet,
      lost: 'DEALER WINS!',
    };

    return titles[status];
  }

  private getResult() {
    if (this.playerScore > 21) {
      return 'busted';
    } else if (this.dealerScore > 21 || this.playerScore > this.dealerScore) {
      return 'won';
    } else if (this.dealerScore === this.playerScore) {
      return 'push';
    } else {
      return 'lost';
    }
  }

  private show(embed: MessageEmbed, channel?: TextBasedChannelFields) {
    if (this.botMessage) {
      return this.botMessage.edit({ embed });
    } else {
      return channel?.send({ embed });
    }
  }
}
