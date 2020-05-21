import { serial as test } from 'ava';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import BankAccountController from '../src/controllers/bankaccount';
import Suggestion from '../src/controllers/suggestion';
import Wallet from '../src/controllers/wallet';
import Bot from '../src/core/Bot';
import TestClient from './mocks/TestClient';
const db = new MongoMemoryServer();
//#region setup
require('dotenv').config();

const TESTER_ID = '705038391540056135';
const THUNDER_ID = '705046929612210267';
const UTIL_CHANNEL_ID = '707927600596779020';
const thunder = new Bot();
const tester = new TestClient(UTIL_CHANNEL_ID);

test.before(async () => {
  await Promise.all([
    connect(await db.getConnectionString(), {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    thunder.start(process.env.THUNDER_TEST_TOKEN || ''),
    thunder.registerCommandsIn('../commands/', '*.ts'),
    tester.login(process.env.TESTER_TOKEN),
    new Promise((resolve) => thunder.once('ready', resolve)),
    new Promise((resolve) => tester.once('ready', resolve)),
  ]);
});

test.beforeEach(async () => {
  await Promise.all([
    new Wallet(THUNDER_ID).delete(),
    new Wallet(TESTER_ID).delete(),
    new BankAccountController(TESTER_ID).delete(),
  ]);
});
//#endregion setup

//#region !about
test('should test the about command', async (t) => {
  const msg = await tester.getResponseTo('!about');

  t.true(
    msg?.embeds[0].description?.startsWith(
      'This bot was created by <@277738577721556994>'
    )
  );
});
//#endregion about

//#region !addmoney
test('should make addmoney command succeed', async (t) => {
  const response = await tester.getResponseTo(`!addmoney 200 <@${TESTER_ID}>`);
  const wallet = await new Wallet(TESTER_ID).get();

  t.is(wallet?.money, 200);
  t.is(response?.embeds[0].description, 'Added 200 to wallet');
});

test('should make addmoney command fail', async (t) => {
  const response = await tester.getResponseTo(`!addmoney 200`);
  const wallet = await new Wallet(TESTER_ID).get();

  t.falsy(wallet?.money);
  t.is(response?.embeds.length, 1);
  t.is(response?.embeds[0].description, "This user doesn't exist");
});

test('should make addmoney command fail', async (t) => {
  const response = await tester.getResponseTo(`!addmoney <@${TESTER_ID}>`);
  const wallet = await new Wallet(TESTER_ID).get();

  t.falsy(wallet?.money);
  t.is(response?.embeds.length, 1);
  t.is(response?.embeds[0].description, 'Please provide a valid number');
});
//#endregion addmoney

//#region !removemoney
test('should make removemoney command succeed', async (t) => {
  const response = await tester.getResponseTo(
    `!removemoney 200 <@${TESTER_ID}>`
  );
  const wallet = await new Wallet(TESTER_ID).get();

  t.is(wallet?.money, -200);
  t.is(response?.embeds[0].title, 'Removed 200 from wallet');
});

test('should make removemoney command fail', async (t) => {
  const response = await tester.getResponseTo(`!removemoney 200`);
  const wallet = await new Wallet(TESTER_ID).get();

  t.falsy(wallet?.money);
  t.is(response?.embeds.length, 1);
  t.is(response?.embeds[0].description, "This user doesn't exist");
});

test('should make removemoney command fail', async (t) => {
  const response = await tester.getResponseTo(`!removemoney <@${TESTER_ID}>`);
  const wallet = await new Wallet(TESTER_ID).get();

  t.falsy(wallet?.money);
  t.is(response?.embeds.length, 1);
  t.is(response?.embeds[0].description, 'Please provide a valid number');
});
//#endregion removemoney

//#region !balance
test('this should show the balance of a NEW user', async (t) => {
  const response = await tester.getResponseTo('!balance');
  t.is(response?.embeds[0].description, '0$');
});

test('this should show the balance of the user', async (t) => {
  await new Wallet(TESTER_ID).delete();
  await new Wallet(TESTER_ID).create({ userId: TESTER_ID, money: 3032 });
  const response = await tester.getResponseTo('!balance');
  t.is(response?.embeds[0].description, '3032$');
});

test('this should show the balance of the user', async (t) => {
  await new Wallet(THUNDER_ID).create({
    money: 8575576,
    userId: THUNDER_ID,
  });
  const response = await tester.getResponseTo(`!balance <@${THUNDER_ID}>`);
  t.is(response?.embeds[0].description, '8575576$');
});
//#endregion balance

//#region !deposit
test('should successfully deposit money to the bank', async (t) => {
  await new Wallet(TESTER_ID).create({ userId: TESTER_ID, money: 200 });
  const response = await tester.getResponseTo('!deposit 200');

  t.is(response?.embeds[0].title, 'Deposited 200 to bank');

  const bankaccount = await new BankAccountController(TESTER_ID).get();
  const wallet = await new Wallet(TESTER_ID).get();

  t.is(bankaccount?.money, 200);
  t.is(wallet?.money, 0);
});

test('should FAIL to deposit money to the bank', async (t) => {
  let response = await tester.getResponseTo('!deposit 200');

  t.not(response?.embeds[0].title, 'Deposited 200 to bank');

  await new Wallet(TESTER_ID).forceGet();

  response = await tester.getResponseTo('!deposit 200');
  const bankaccount = await new BankAccountController(TESTER_ID).get();
  const wallet = await new Wallet(TESTER_ID).get();

  t.falsy(bankaccount?.money);
  t.is(wallet?.money, 0);
});

test('should FAIL to deposit less than 1$', async (t) => {
  await new Wallet(TESTER_ID).create({ money: 200, userId: TESTER_ID });
  const response = await tester.getResponseTo('!deposit 0');
  const bankaccount = await new BankAccountController(TESTER_ID).get();
  const wallet = await new Wallet(TESTER_ID).get();

  t.is(
    response?.embeds[0].description,
    "You can't add less than 1:moneybag: to someones wallet"
  );
  t.falsy(bankaccount?.money);
  t.is(wallet?.money, 200);
});
//#endregion !deposit

//#region !givemoney
test('should successfully give money Thunder', async (t) => {
  await new Wallet(TESTER_ID).create({ userId: TESTER_ID, money: 200 });
  const response = await tester.getResponseTo(
    `!givemoney 200 <@${THUNDER_ID}>`
  );

  t.is(response?.embeds[0].description, `Gave 200 to <@${THUNDER_ID}>`);

  const thunderWallet = await new Wallet(THUNDER_ID).get();
  const testerWallet = await new Wallet(TESTER_ID).get();

  t.is(thunderWallet?.money, 200);
  t.is(testerWallet?.money, 0);
});

test('should FAIL to give money to Thunder', async (t) => {
  await new Wallet(TESTER_ID).create({ money: 200, userId: TESTER_ID });
  const response = await tester.getResponseTo(`!givemoney 200`);
  const wallet = await new Wallet(TESTER_ID).get();

  t.is(wallet?.money, 200);
  t.is(response?.embeds.length, 1);
  t.is(response?.embeds[0].description, "This user doesn't exist");
});

test('should FAIL to give less than 1$', async (t) => {
  const response = await tester.getResponseTo('!givemoney -1');

  t.is(
    response?.embeds[0].description,
    "You can't add less than 1:moneybag: to someones wallet"
  );
});

test('should FAIL to give more than he has', async (t) => {
  await new Wallet(TESTER_ID).create({ money: 200, userId: TESTER_ID });
  const response = await tester.getResponseTo(
    `!givemoney 220 <@${THUNDER_ID}>`
  );
  const wallet = await new Wallet(TESTER_ID).get();
  const thunderWallet = await new Wallet(THUNDER_ID).get();

  t.is(
    response?.embeds[0].description,
    "That's kind, but you can't afford to give away so much money :frowning:"
  );
  t.is(wallet?.money, 200);
  t.falsy(thunderWallet?.money);
});
//#endregion givemoney

//#region !help
test('should return a list of commands', async (t) => {
  const response = await tester.getResponseTo('!help');
  t.truthy(response?.embeds[0].description);
});
//#endregion !help

//#region !profile
test("should return Testers's profile", async (t) => {
  await new Wallet(TESTER_ID).create({ userId: TESTER_ID, money: 670 });
  await new BankAccountController(TESTER_ID).create({
    money: 34,
    userId: TESTER_ID,
  });

  const response = await tester.getResponseTo('!profile');

  t.is(response?.embeds[0].fields[0].value, '670$');
  t.is(response?.embeds[0].fields[1].value, '34$');
});
//#endregion !profile

//#region !suggest
test('this should add a new suggestion', async (t) => {
  const suggestion = 'Please add a !use command';
  const response = await tester.getResponseTo(`!suggest ${suggestion}`);
  const suggestionDoc = await new Suggestion(suggestion, TESTER_ID).get();

  t.is(
    response?.embeds[0].description,
    'Thank you for your suggestion, we are going to try our best to consider add it with the next release'
  );
  t.is(suggestionDoc?.content, suggestion);
});

test('this should add a new suggestion', async (t) => {
  const response = await tester.getResponseTo(`!suggest`);

  t.is(
    response?.embeds[0].description,
    'Please provide a suggestion as second argument'
  );
});
//#endregion !suggest

test.after(async () => {
  await connection.dropDatabase();
  await connection.close();
  await db.stop();
});
