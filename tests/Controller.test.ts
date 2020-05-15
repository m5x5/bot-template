import { serial as test } from 'ava';
import { connect, connection } from 'mongoose';
import User from '../src/controllers/user';
import { MongoMemoryServer } from 'mongodb-memory-server';

require('dotenv').config();
const TEST_USER_ID = '38482902849';
const db = new MongoMemoryServer();

test.before(async () => {
  await connect(await db.getConnectionString(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

test('Controller.create', async (ctx) => {
  ctx.is((await new User(TEST_USER_ID).create()).userId, '38482902849');
});

test('Controller.increase', async (ctx) => {
  const user = new User(TEST_USER_ID);
  await user.increase('lastBankrob', 50);
  const userData = await user.get();

  ctx.is(userData?.lastBankrob, 50);
  ctx.not(userData?.lastBankrob, 0);
});

test('Controller.get', async (t) => {
  const user = new User(TEST_USER_ID);
  const userData = await user.get();

  t.truthy(userData);
  t.is(userData?.userId, TEST_USER_ID);
  t.not(userData?.userId, 'invalid_id');
});

test('Controller.update', async (t) => {
  const user = new User(TEST_USER_ID);
  await user.update('items', ['pistol']);
  const userData = await user.get();
  t.is(userData?.items[0], 'pistol');
});

test('Controller.pushItemToField', async (t) => {
  const user = new User(TEST_USER_ID);
  await user.pushItemToField('items', 'mask');
  const userData = await user.get();
  t.not(userData?.items, ['pistol']);
  t.is(userData?.items[0], 'pistol');
  t.is(userData?.items[1], 'mask');
});

test('Controller.delete', async (t) => {
  const user = new User(TEST_USER_ID);
  await user.delete();
  const userData = await user.get();

  t.falsy(userData);
});

test.after(async () => {
  await connection.dropDatabase();
  await connection.close();
  await db.stop();
});
