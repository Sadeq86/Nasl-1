// lanya.js — FINAL 100% WORKING (Commands will appear!)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Everything is up!'));
app.listen(10000, () => console.log('Express server running on http://localhost:10000'));

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
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

global.styles = {
  success: chalk.bold.green,
  warning: chalk.bold.yellow,
  error: chalk.red,
};

// Load handlers
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

// Deploy commands correctly
client.once('ready', async () => {
  console.log(`Bot online as ${client.user.tag}`);

  try {
    console.log('Deploying commands...');

    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');

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
              console.log(`Added: /${cmd.data.name}`);
            }
          } catch (e) {
            console.warn(`Skipped broken command: ${item}`);
          }
        }
      }
    };

    if (fs.existsSync(commandsPath)) {
      load(commandsPath);
      await client.application.commands.set(commands);
      console.log(`Successfully deployed ${commands.length} commands!`);
    } else {
      console.log('src/commands not found');
    }
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
