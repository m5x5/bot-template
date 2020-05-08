import { serial as test } from 'ava';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect } from 'mongoose';
import Bot from '../src/core/Bot';
import TestClient from './mocks/TestClient';
const db = new MongoMemoryServer();

require('dotenv').config();

const FUN_CHANNEL_ID = '708306011315765299';
const thunder = new Bot();
const tester = new TestClient(FUN_CHANNEL_ID);

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

//#region !meme
test('should return a meme', async (t) => {
  const response = await tester.getResponseTo('!meme');

  t.truthy(response?.embeds[0].footer);
  t.truthy(response?.embeds[0].image);
});

test('should return a specific meme', async (t) => {
  const response = await tester.getResponseTo('!meme catmeme');

  t.truthy(response?.embeds[0].footer);
  t.truthy(response?.embeds[0].image);
});
//#endregion !meme
