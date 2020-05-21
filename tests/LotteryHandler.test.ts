import { serial as test } from 'ava';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import Wallet from '../src/controllers/wallet';
import Bot from '../src/core/Bot';
import LotteryHandler from '../src/events/LotteryHandler';
import TestClient from './mocks/TestClient';

require('dotenv').config();

const db = new MongoMemoryServer();
const LOTTERY_CHANNEL_ID = '705040985918275584';
const TESTER_ID = '705038391540056135';
const thunder = new Bot();
const tester = new TestClient(LOTTERY_CHANNEL_ID);
let lotteryHandler: LotteryHandler | undefined;

test.before(async () => {
  await Promise.all([
    connect(await db.getConnectionString(), {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    thunder.start(process.env.TEST_TOKEN || ''),
    thunder.registerCommandsIn('../commands/economy', '*.ts'),
    tester.login(process.env.TESTER_TOKEN),
    new Promise((resolve) => thunder.once('ready', resolve)),
    new Promise((resolve) => tester.once('ready', resolve)),
  ]);
  lotteryHandler = thunder.handlers?.lottery;
});

test.beforeEach(async () => {
  if (lotteryHandler) {
    lotteryHandler.playerIds = [];
    lotteryHandler.lotteryIsActive = false;
  }
  await new Wallet(TESTER_ID).delete();
});

test('should fail to buy a ticket', async (t) => {
  const [, msg] = await Promise.all([
    tester.sendMessage('!buyticket'),
    tester.waitForMessage(),
  ]);

  t.is(
    msg?.content,
    '<@705038391540056135>, :thinking: The lottery is not open at the moment. Why would you want to buy a ticket?'
  );
});

test('should start a lottery', async (t) => {
  const msg = await tester.getResponseTo('!startlottery');

  t.is(msg?.embeds[0]?.title, 'Lottery opened :moneybag:');
});

test('should end the lottery', async (t) => {
  await Promise.all([
    await tester.sendMessage('!startlottery'),
    tester.waitForMessage(),
  ]);
  const [, msg] = await Promise.all([
    lotteryHandler?.finishAndEvaluateLottery(),
    tester.waitForMessage(),
  ]);

  t.is(
    msg?.embeds[0].description,
    'Nobody won, because nobody took part in the lottery :('
  );
  t.is(lotteryHandler?.lotteryIsActive, true);
});

test('should win the lottery', async (t) => {
  await tester.getResponseTo('!startlottery');

  // Should add the Tester Bot as single participant
  lotteryHandler?.playerIds.push(TESTER_ID);

  const [, msg] = await Promise.all([
    lotteryHandler?.finishAndEvaluateLottery(),
    tester.waitForMessage(),
  ]);

  const wallet = await new Wallet(TESTER_ID).get();

  t.is(wallet?.money, 50000);
  t.is(msg?.embeds[0].description, `<@${TESTER_ID}> has won 50k`);
  t.is(lotteryHandler?.lotteryIsActive, true);
});

test('should buy a ticket', async (t) => {
  await tester.getResponseTo('!startlottery');

  const wallet = new Wallet(TESTER_ID);
  await wallet.create({ money: 200, userId: TESTER_ID });
  const confirmMsg = await tester.getResponseTo('!buyticket');

  t.is(
    confirmMsg?.content,
    `<@${TESTER_ID}>, Are you sure you want to buy a ticket for 100$?`
  );

  const [, successMsg] = await Promise.all([
    confirmMsg?.react('✅'),
    tester.waitForMessage(),
  ]);

  t.is(successMsg?.embeds[0]?.title, 'You bought a ticket');
  t.is((await wallet.get())?.money, 100);
});

test('should cancel the purchase of a ticket', async (t) => {
  await tester.getResponseTo('!startlottery');

  const wallet = new Wallet(TESTER_ID);
  await wallet.create({ money: 200, userId: TESTER_ID });
  const confirmMsg = await tester.getResponseTo('!buyticket');

  t.is(
    confirmMsg?.content,
    `<@${TESTER_ID}>, Are you sure you want to buy a ticket for 100$?`
  );

  const [, successMsg] = await Promise.all([
    confirmMsg?.react('❌'),
    tester.waitForMessage(),
  ]);

  t.is(successMsg?.content, `<@${TESTER_ID}>, Purchase cancelled.`);
  t.is((await wallet.get())?.money, 200);
});

test('should fail to buy a ticket', async (t) => {
  await tester.getResponseTo('!startlottery');

  const response = await tester.getResponseTo('!buyticket');

  t.is(response?.content, `<@${TESTER_ID}>, You don\'t have enough money`);
});

test.after(async () => {
  await connection.dropDatabase();
  await connection.close();
  await db.stop();
});
