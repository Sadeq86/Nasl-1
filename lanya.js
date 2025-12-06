const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Everything is up!');
});
app.listen(10000, () => {
  console.log('Express server running on http://localhost:10000');
});

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { autoPlayFunction } = require('./functions/autoPlay');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.lavalink = new LavalinkManager({
  nodes: [
    {
      authorization: process.env.LL_PASSWORD,
      host: process.env.LL_HOST,
      port: parseInt(process.env.LL_PORT, 10),
      id: process.env.LL_NAME,
    },
  ],
  sendToShard: (guildId, payload) =>
    client.guilds.cache.get(guildId)?.shard?.send(payload),
  autoSkip: true,
  client: {
    id: process.env.DISCORD_CLIENT_ID,
    username: 'Lanya',
  },
  playerOptions: {
    onEmptyQueue: {
      destroyAfterMs: 30_000,
      autoPlayFunction: autoPlayFunction,
    },
  },
});

const styles = {
  successColor: chalk.bold.green,
  warningColor: chalk.bold.yellow,
  infoColor: chalk.bold.blue,
  commandColor: chalk.bold.cyan,
  userColor: chalk.bold.magenta,
  errorColor: chalk.red,
  highlightColor: chalk.bold.hex('#FFA500'),
  accentColor: chalk.bold.hex('#00FF7F'),
  secondaryColor: chalk.hex('#ADD8E6'),
  primaryColor: chalk.bold.hex('#FF1493'),
  dividerColor: chalk.hex('#FFD700'),
};
global.styles = styles;

const handlerFiles = fs
  .readdirSync(path.join(__dirname, 'handlers'))
  .filter((file) => file.endsWith('.js'));
let counter = 0;
for (const file of handlerFiles) {
  counter += 1;
  const handler = require(`./handlers/${file}`);
  if (typeof handler === 'function') {
    handler(client);
  }
}
console.log(
  global.styles.successColor(`Successfully loaded ${counter} handlers`)
);

// فیکس نهایی: پاک کردن دستورات قدیمی + فقط گذاشتن دستورات واقعی
client.once('ready', async () => {
  console.log(`Bot online as ${client.user.tag}`);

  try {
    console.log('Clearing old commands & deploying fresh ones...');

    // همه دستورات قبلی رو از دیسکورد پاک کن
    await client.application.commands.set([]);
    
    // فقط دستوراتی که الان فایلشون هست رو دوباره بذار
    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');

    const loadCommands = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);
        if (stat.isDirectory()) {
          loadCommands(filePath);
        } else if (file.endsWith('.js')) {
          try {
            const command = require(filePath);
            if (command.data && command.data.toJSON) {
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
      console.log(`Deployed ${commands.length} real commands. Old junk removed!`);
    } else {
      console.log('commands folder not found, skipping deploy');
    }
  } catch (error) {
    console.error('Command deploy error:', error.message);
  }
});

// لاگین آخر
client.login(process.env.DISCORD_TOKEN);
