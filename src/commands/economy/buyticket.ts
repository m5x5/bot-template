import { Command } from '../../core/Command';

export default new Command({
  aliases: [
    'buyticket',
    'ticketbuy',
    'buylotteryticket',
    'getticket',
    'ticketget',
    'getlotteryticket',
  ],
  guildOnly: true,
  name: 'Buy Ticket Command',
  command(message) {
    message.client.emit<any>('LotteryHandler:buyTicket', message);
  },
});
