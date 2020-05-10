import { ShardingManager } from 'discord.js';
import { join } from 'path';
require('dotenv').config();

const shardDebugger = require('debug')('thunder:shard');

shardDebugger('shard.js started');
const shard = new ShardingManager(join(__dirname, './index.js'), {
  shardArgs: process.execArgv,
  token: process.env.TOKEN,
});

// tslint:disable-next-line: no-floating-promises
shard.spawn(1);

shard.on('shardCreate', (createdShard) =>
  shardDebugger(`Shard ${createdShard.id}/${createdShard.listenerCount}`)
);
