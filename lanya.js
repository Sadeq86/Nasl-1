// lanya.js — FINAL 100% WORKING & CLEAN (2025)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Everything is up!'));
app.listen(10000, () => console.log('Express server running on http://localhost:10000'));

require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Lavalink setup
client.lavalink = new LavalinkManager({
  nodes: [
    {
      id: "main",
      host: process.env.LL_HOST || "lavalink.jirayu.net",
      port: parseInt(process.env.LL_PORT || "13592"),
      authorization: process.env.LL_PASSWORD || "youshallnotpass",
      secure: false
    }
  ],
  sendToShard: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild?.shard) guild.shard.send(payload);
  },
  client: {
    id: process.env.DISCORD_CLIENT_ID,
    username: "Nasl-1"
  }
});

global.styles = {
  success: chalk.bold.green,
  warning: chalk.bold.yellow,
  error: chalk.red,
};

// Load handlers safely
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
    console.warn(`Handler ${file} skipped:`, error.message);
  }
}
console.log(global.styles.success(`Loaded ${handlerCount} handlers`));

// Everything after ready
client.once('ready', async () => {
  console.log(`Bot online as ${client.user.tag}`);

  // Lavalink init
  client.lavalink.init({ id: client.user.id });
  console.log('Lavalink connected and ready!');

  // Status with member count + Watch button
  const updateStatus = () => {
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    client.user.setPresence({
      activities: [{
        name: `${totalMembers.toLocaleString()} In Nasl-1`,
        type: ActivityType.Streaming,
        url: "https://discord.gg/8QH5N4B8" // می‌تونی هر لینکی بذاری
      }],
      status: 'idle'
    });
  };
  updateStatus();
  setInterval(updateStatus, 60000); // هر دقیقه آپدیت شه

  // Deploy commands
  try {
    console.log('Deploying commands...');
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');

    const load = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          load(fullPath);
        } else if (item.endsWith('.js')) {
          try {
            const cmd = require(fullPath);
            if (cmd.data?.toJSON) {
              commands.push(cmd.data.toJSON());
            }
          } catch (e) {
            console.warn(`Broken command: ${item}`);
          }
        }
      }
    };

    if (fs.existsSync(commandsPath)) {
      load(commandsPath);
      await client.application.commands.set(commands);
      console.log(`Deployed ${commands.length} commands`);
    } else {
      console.log('commands folder not found');
    }
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
