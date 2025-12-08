// lanya.js — FINAL 100% WORKING ENGLISH VERSION (DECEMBER 2025)
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

// Lavalink setup — using lavalink.jirayu.net
client.lavalink = new LavalinkManager({
  nodes: [
    {
      id: "main",
      host: "lavalink.jirayu.net",
      port: 13592,
      authorization: "youshallnotpass",
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
    console.warn(`Handler ${file} failed:`, error.message);
  }
}
console.log(global.styles.success(`Loaded ${handlerCount} handlers`));

// Everything after bot is ready
client.once('ready', async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  // Initialize Lavalink
  client.lavalink.init({ id: client.user.id });
  console.log('Lavalink connected and ready!');

  // Status: Streaming + member count + Watch button
  const updateStatus = () => {
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    client.user.setPresence({
      activities: [{
        name: `${totalMembers.toLocaleString()} In Nasl-1`,
        type: ActivityType.Streaming,
        url: "https://discord.gg/SFg3c43M"
      }],
      status: 'idle'
    });
  };
  updateStatus();
  setInterval(updateStatus, 60000);
  console.log('Status set: Streaming + member count');

  // Deploy commands
  try {
    console.log('Deploying commands...');
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');

    const loadCommands = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          loadCommands(fullPath);
        } else if (item.endsWith('.js')) {
          try {
            const cmd = require(fullPath);
            if (cmd.data?.toJSON) {
              commands.push(cmd.data.toJSON());
            }
          } catch (e) {
            console.warn(`Skipped broken command: ${item}`);
          }
        }
      }
    };

    if (fs.existsSync(commandsPath)) {
      loadCommands(commandsPath);
      await client.application.commands.set(commands);
      console.log(`Successfully deployed ${commands.length} commands`);
    } else {
      console.log('commands folder not found');
    }
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
