// lanya.js — FINAL 100% ONLINE — NO MORE READY.JS NEEDED
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Nasl-1 is alive!'));
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Express server running on port ${PORT}`)
).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Port 5000 already in use, skipping express server start');
  } else {
    console.error(err);
  }
});

require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Define global styles for console output
global.styles = {
  successColor: (text) => chalk.green(text),
  errorColor: (text) => chalk.red(text),
  warningColor: (text) => chalk.yellow(text),
  infoColor: (text) => chalk.cyan(text),
  accentColor: (text) => chalk.magenta(text),
  primaryColor: (text) => chalk.blue(text),
  commandColor: (text) => chalk.white.bold(text),
  dividerColor: (text) => chalk.gray(text),
  userColor: (text) => chalk.blueBright(text),
  highlightColor: (text) => chalk.yellowBright(text),
  secondaryColor: (text) => chalk.cyanBright(text),
};

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
  nodes: [
    {
      id: 'main',
      host: 'lavalink.jirayu.net',
      port: 13592,
      authorization: 'youshallnotpass',
      secure: false,
    },
  ],
  sendToShard: () => {},
  client: { id: process.env.DISCORD_CLIENT_ID, username: 'Nasl-1' },
});

// Load handlers
fs.readdirSync(path.join(__dirname, 'handlers'))
  .filter((f) => f.endsWith('.js'))
  .forEach((file) => {
    try {
      require(`./handlers/${file}`)(client);
    } catch (e) {
      console.warn(`Handler ${file} failed`);
    }
  });

console.log(chalk.green('All handlers & events loaded'));

// READY — همه چیز اینجا!
client.once('ready', (c) => {
  console.log(`BOT IS 100% ONLINE as ${c.user.tag} — Nasl-1 is ALIVE!`);

  // Lavalink init
  client.lavalink.init({ id: c.user.id });
  console.log('Lavalink connected');

  // Status Rotation
  let index = 0;
  const update = () => {
    const total = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const statuses = [
      {
        name: `${total.toLocaleString()} In Nasl-1`,
        type: ActivityType.Streaming,
        url: 'https://twitch.tv/nasl1',
      },
      {
        name: `🎟️ | Nasl-1 Private Games`,
        type: ActivityType.Streaming,
        url: 'https://twitch.tv/nasl1',
      },
      {
        name: `👑 #1 Family In Iran`,
        type: ActivityType.Streaming,
        url: 'https://twitch.tv/nasl1',
      },
    ];

    const current = statuses[index];
    client.user.setActivity(current.name, {
      type: current.type,
      url: current.url,
    });

    index = (index + 1) % statuses.length;
  };
  update();
  setInterval(update, 3000);
});

// Ranked Bedwars Queue State
client.rankedQueue = {
  players: [],
  captains: [],
  teams: { 1: [], 2: [] },
  pickingTurn: null, // 'cap1' or 'cap2'
  pickStep: 0,
  active: false,
  messageId: null,
  channelId: '1456341739110400074',
  voiceId: '1437117580807504033',
  team1Voice: '1437124985398231040',
  team2Voice: '1437124808008798238',
};

const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (
    newState.channelId === client.rankedQueue.voiceId &&
    oldState.channelId !== client.rankedQueue.voiceId
  ) {
    const channel = newState.channel;
    if (channel.members.size === 8 && !client.rankedQueue.active) {
      client.rankedQueue.active = true;
      const players = Array.from(channel.members.values());
      client.rankedQueue.players = players;

      // Randomly pick 2 captains
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      const cap1 = shuffled.shift();
      const cap2 = shuffled.shift();

      client.rankedQueue.captains = [cap1, cap2];
      client.rankedQueue.teams[1] = [cap1];
      client.rankedQueue.teams[2] = [cap2];
      client.rankedQueue.remainingPlayers = shuffled;
      client.rankedQueue.pickingTurn = 'cap1';
      client.rankedQueue.pickStep = 1; // Step 1: Cap1 picks 1

      const embed = new EmbedBuilder()
        .setTitle('🎮 | Nasl-1 Private Game')
        .setColor('Blue')
        .addFields(
          { name: '🎭 | Captain 1', value: `🗣️ | ${cap1}`, inline: true },
          { name: '🎭 | Captain 2', value: `🗣️ | ${cap2}`, inline: true },
          { name: ' ', value: '--------------------------------------' },
          {
            name: '📌 | Remaining Players',
            value: client.rankedQueue.remainingPlayers
              .map((p) => `👤 | ${p}`)
              .join('\n'),
          }
        )
        .setFooter({
          text: `It's ${cap1.user.username}'s turn to pick 1 player!`,
        });

      const targetChannel = await client.channels.fetch(
        client.rankedQueue.channelId
      );
      const msg = await targetChannel.send({
        content: `${cap1} ${cap2}`,
        embeds: [embed],
      });
      client.rankedQueue.messageId = msg.id;
    }
  }
});

// Login — آخرین خط!
client
  .login(process.env.DISCORD_TOKEN)
  .then(() => console.log('Logged in successfully'))
  .catch((err) => {
    console.error('Login failed:', err);
    process.exit(1);
  });
