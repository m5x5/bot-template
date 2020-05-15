import { AwaitMessagesOptions, Client, Message, TextChannel } from 'discord.js';
import Wallet from '../../src/controllers/wallet';
import { IWallet } from '../../src/models/wallet';

export default class TestClient extends Client {
  testGuildId = '705033176585601065';

  constructor(public testChannelId = '705040985918275584') {
    super();
  }

  async waitForMessage(options: AwaitMessagesOptions = {}) {
    const testChannel = this.getTestChannel();

    if (!testChannel) throw new Error("Couldn't find the guild");

    const collector = await testChannel.awaitMessages(
      (message) => message.author.id === '705046929612210267',
      Object.assign({ max: 1 }, options)
    );
    return collector.first();
  }

  sendMessage(content: string) {
    const testChannel = this.getTestChannel();

    if (!testChannel) throw new Error("Couldn't find the guild");
    return testChannel.send(content);
  }

  getTestChannel() {
    const guild = this.getTestGuild();

    return (
      (guild?.channels.cache.get(this.testChannelId) as
        | TextChannel
        | undefined) ||
      (guild?.channels.resolve(this.testChannelId) as TextChannel | undefined)
    );
  }

  getTestGuild() {
    return (
      this.guilds.cache.get(this.testGuildId) ||
      this.guilds.resolve(this.testGuildId)
    );
  }

  async _getResponseTo(command: string): Promise<Message | undefined> {
    const [, response] = await Promise.all([
      this.sendMessage(command),
      this.waitForMessage(),
    ]);
    return response;
  }

  getWallet(): Promise<IWallet | null> {
    return new Wallet(this.user?.id || '').get();
  }

  async getResponseTo(command: string): Promise<Message> {
    await this.sendMessage(command);
    return new Promise((resolve) => {
      this.on('message', (msg) => {
        this.removeListener('message', (msg) => {});
        resolve(msg);
      });
    });
  }
}
