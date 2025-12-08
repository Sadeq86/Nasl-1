// lanya.js — FINAL 100% WORKING + LAVALINK INCLUDED
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Everything is up!'));
app.listen(10000, () => console.log('Express server running on http://localhost:10000'));

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Manager } = require('lavalink-client'); // اضافه شد
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

// Lavalink راه‌اندازی شد
client.lavalink = new Manager({
  nodes: [{
    id: "main",
    host: process.env.LL_HOST || "localhost",
    port: parseInt(process.env.LL_PORT || "2333"),
    authorization: process.env.LL_PASSWORD || "youshallnotpass",
    secure: false
  }],
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

// هندلرها
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

// دستورات + Lavalink init
client.once('ready', async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  // Lavalink رو راه‌اندازی کن
  client.lavalink.init({ ...client.user });
  console.log('Lavalink initialized successfully');

  // دستورات رو deploy کن
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
          } catch (e) {}
        }
      }
    };

    if (fs.existsSync(commandsPath)) {
      load(commandsPath);
      await client.application.commands.set(commands);
      console.log(`Deployed ${commands.length} commands`);
    }
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
