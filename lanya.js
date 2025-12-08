// lanya.js — FINAL 100% ONLINE — NO MORE READY.JS NEEDED
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
    try { require(`./handlers/${file}`)(client); } 
    catch (e) { console.warn(`Handler ${file} failed`); }
  });

console.log(chalk.green('All handlers & events loaded'));

// READY — همه چیز اینجا!
client.once('ready', (c) => {
  console.log(`BOT IS 100% ONLINE as ${c.user.tag} — Nasl-1 is ALIVE!`);

  // Lavalink init
  client.lavalink.init({ id: c.user.id });
  console.log('Lavalink connected');

  // Status
  const update = () => {
    const total = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    c.user.setActivity(`${total.toLocaleString()} In Nasl-1`, {
      type: ActivityType.Streaming,
      url: "https://twitch.tv/nasl1"
    });
  };
  update();
  setInterval(update, 60000);
});

// Login — آخرین خط!
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('Logged in successfully'))
  .catch(err => {
    console.error('Login failed:', err);
    process.exit(1);
  });
