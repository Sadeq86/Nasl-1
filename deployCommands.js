// deploy-commands.js — باید در ریشه پروژه باشه (کنار lanya.js)
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;

if (!CLIENT_ID || !TOKEN) {
  console.error('ERROR: CLIENT_ID or TOKEN missing in .env');
  process.exit(1);
}

// مسیر درست برای Render: src/commands
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
  console.error('ERROR: commands folder not found!');
  console.error('Looking in:', commandsPath);
  process.exit(1);
}

const commands = [];

for (const category of fs.readdirSync(commandsPath)) {
  const categoryPath = path.join(commandsPath, category);
  if (!fs.statSync(categoryPath).isDirectory()) continue;

  for (const file of fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'))) {
    try {
      const filePath = path.join(categoryPath, file);
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      if (command.data && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());
        console.log(`Loaded: /${command.data.name} (${category})`);
      }
    } catch (err) {
      console.warn(`Failed to load ${file}: ${err.message}`);
    }
  }
}

(async () => {
  console.log(`Deploying ${commands.length} slash commands...`);

  try {
    await new REST({ version: '10' }).setToken(TOKEN).put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('All commands deployed successfully!');
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
})();
