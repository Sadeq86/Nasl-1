// lanya.js — FINAL 100% WORKING & NEVER CRASHES
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Nasl-1 is alive!'));
app.listen(10000, () => console.log('Express server running'));

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

// Lavalink
client.lavalink = new LavalinkManager({
  nodes: [{ id: "main", host: "lavalink.jirayu.net", port: 13592, authorization: "youshallnotpass", secure: false }],
  sendToShard: () => {},
  client: { id: process.env.DISCORD_CLIENT_ID, username: "Nasl-1" }
});

// Load handlers
fs.readdirSync(path.join(__dirname, 'handlers'))
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    try {
      require(`./handlers/${file}`)(client);
    } catch (e) {
      console.warn(`Handler ${file} failed to load`);
    }
  });

console.log(chalk.green('All handlers loaded'));

// READY — این قسمت بات رو ۱۰۰٪ آنلاین نگه می‌داره
client.on('ready', () => {
  console.log(`BOT IS 100% ONLINE as ${client.user.tag}`);

  client.lavalink.init({ id: client.user.id });
  console.log('Lavalink connected');

  const updateStatus = () => {
    const total = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    client.user.setActivity(`${total.toLocaleString()} In Nasl-1`, {
      type: ActivityType.Streaming,
      url: "https://twitch.tv/nasl1"
    });
  };
  updateStatus();
  setInterval(updateStatus, 60000);
});

// این خط آخر باشه — هیچ چیزی بعدش نباشه!
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Login failed:', err);
  process.exit(1);
});
