// lanya.js — FINAL ENGLISH & UNBREAKABLE VERSION
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Everything is up!'));
app.listen(10000, () => console.log('Express server running on http://localhost:10000'));

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { LavalinkManagerServer } = require('lavalink-client');
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

client.lavalink = new LavalinkManager({
  nodes: [{
    authorization: process.env.LL_PASSWORD,
    host: process.env.LL_HOST,
    port: parseInt(process.env.LL_PORT, 10),
    id: process.env.LL_NAME,
  }],
  sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
  autoSkip: true,
  client: { id: process.env.DISCORD_CLIENT_ID, username: 'Lanya' },
  playerOptions: { onEmptyQueue: { destroyAfterMs: 30_000, autoPlayFunction } },
});

global.styles = {
  success: chalk.bold.green,
  warning: chalk.bold.yellow,
  error: chalk.red,
};

// Load handlers safely (no crash if one is broken)
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
    console.warn(`Handler ${file} failed to load and was skipped:`, error.message);
  }
}
console.log(global.styles.success(`Successfully loaded ${handlerCount} handlers`));

// Auto-deploy only real commands on startup
client.once('ready', async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  try {
    console.log('Clearing old commands...');
    await client.application.commands.set([]); // Remove all old commands

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
            // Ignore broken command files
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
    console.error('Failed to deploy commands:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
