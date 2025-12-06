const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Everything is up!'));
app.listen(10000, () => console.log('Express server running on http://localhost:10000'));

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
  successColor: chalk.bold.green,
  warningColor: chalk.bold.yellow,
  errorColor: chalk.red,
};

// هندلرها
const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(f => f.endsWith('.js'));
let counter = 0;
for (const file of handlerFiles) {
  counter++;
  require(`./handlers/${file}`)(client);
}
console.log(global.styles.successColor(`Successfully loaded ${counter} handlers`));

// مهم‌ترین قسمت: دستورات رو درست deploy کن (فقط دستورات واقعی!)
client.once('ready', async () => {
  console.log(`بات روشن شد: ${client.user.tag}`);

  try {
    console.log('در حال پاک کردن دستورات قدیمی...');
    await client.application.commands.set([]); // همه رو پاک کن

    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands'); // مسیر درست برای Render

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
      console.log(`${commands.length} دستور با موفقیت deploy شد`);
    } else {
      console.log('پوشه src/commands پیدا نشد!');
    }
  } catch (error) {
    console.error('خطا در deploy:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
