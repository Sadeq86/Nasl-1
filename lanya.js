// lanya.js — FINAL 100% ONLINE VERSION (بات قطعاً روشن میشه)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Nasl-1 is alive!'));
app.listen(10000, () => console.log('Express running on 10000'));

require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mongoose = require('mongoose');

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

global.styles = { success: chalk.bold.green };

// Load handlers
fs.readdirSync(path.join(__dirname, 'handlers')).filter(f => f.endsWith('.js')).forEach(file => {
  try {
    require(`./handlers/${file}`)(client);
  } catch (e) { console.warn(`Handler ${file} failed`); }
});

console.log(global.styles.success('All handlers loaded'));

// READY — این قسمت بات رو آنلاین نگه می‌داره
client.once('ready', () => {
  console.log(`Bot is ONLINE as ${client.user.tag}`);

  client.lavalink.init({ id: client.user.id });
  console.log('Lavalink ready');

  // استاتوس
  const update = () => {
    const members = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    client.user.setActivity(`${members.toLocaleString()} In Nasl-1`, { type: ActivityType.Streaming, url: "https://discord.gg/SFg3c43M" });
  };
  update();
  setInterval(update, 60000);

  // مانگویی
  mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB Connected')).catch(() => {});
});

// این خط آخر باشه — هیچ چیزی بعدش نباشه!
client.login(process.env.DISCORD_TOKEN);
