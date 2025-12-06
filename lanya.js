// lanya.js — FINAL 100% WORKING ENGLISH VERSION (DECEMBER 2025)
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

// Deploy commands ONLY from root "commands" folder (your current structure)
client.once('ready', async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  try {
    console.log('Deploying slash commands...');

    const commands = [];
    const commandsPath = path.join(__dirname, 'commands'); // your folder is in root

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
              console.log(`Loaded command: /${command.data.name}`);
            }
          } catch (e) {
            console.warn(`Skipped broken file: ${item}`);
          }
        }
      }
    };

    if (fs.existsSync(commandsPath)) {
      loadCommands(commandsPath);

      // This line fixes "This command is outdated"
      await client.application.commands.set(commands);
      console.log(`Successfully deployed ${commands.length} commands!`);
    } else {
      console.error('commands folder not found in project root!');
    }
  } catch (error) {
    console.error('Failed to deploy commands:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
