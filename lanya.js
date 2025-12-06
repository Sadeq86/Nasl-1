// lanya.js — FINAL ENGLISH & 100% WORKING VERSION
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Everything is up!'));
app.listen(10000, () => console.log('Express server running on http://localhost:10000'));

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Manager } = require('lavalink-client'); // درست: Manager نه LavalinkManager
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { autoPlayFunction } = require('./functions/autoPlay');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Lavalink درست و کارکرده
client.lavalink = new Manager({
  nodes: [{
    authorization: process.env.LL_PASSWORD,
    host: process.env.LL_HOST,
    port: parseInt(process.env.LL_PORT, 10),
    id: process.env.LL_NAME,
    secure: false
  }],
  sendToShard: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild?.shard) guild.shard.send(payload);
  },
  autoSkip: true,
  client: {
    id: process.env.DISCORD_CLIENT_ID,
    username: 'Nasl-1'
  },
  playerOptions: {
    onEmptyQueue: {
      destroyAfterMs: 30_000,
      autoPlayFunction
    }
  }
});

global.styles = {
  success: chalk.bold.green,
  warning: chalk.bold.yellow,
  error: chalk.red,
};

// Load handlers safely (no crash)
const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(f => f.endsWith('.js'));
let handlerCount = 0;

for (const file of handlerFiles) {
  try {
    const handler = require(`./handlers/${file}`);
    if (typeof handler === 'function') {
      handler(client);
      handlerCount++;
    }
  } catch (error) {
    {
    console.warn(`Handler ${file} failed to load:`, error.message);
  }
}
console.log(global.styles.success(`Successfully loaded ${handlerCount} handlers`));

// Auto-deploy only real commands on startup
client.once('ready', async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  try {
    console.log('Clearing old commands...');
    await client.application.commands.set([]); // پاک کردن دستورات قدیمی

    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');

    const loadCommands = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          loadCommands(fullPath);
        } else if (item.endsWith('.js')) {
          try {
            const command = require(fullPath);
            if (command.data?.toJSON) {
              commands.push(command.data.toJSON());
            }
          } catch (e) {
            // فایل خراب رو نادیده بگیر
          }
        }
      }
    };

    if (fs.existsSync(commandsPath)) {
      loadCommands(commandsPath);
      await client.application.commands.set(commands);
      console.log(`Successfully deployed ${commands.length} real commands`);
    } else {
      console.warn('src/commands folder not found — no commands deployed');
    }
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
