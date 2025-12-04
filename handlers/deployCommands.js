// deploy-commands.js — English & Bulletproof Version
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;

if (!CLIENT_ID || !TOKEN) {
  console.error('ERROR: CLIENT_ID or TOKEN is missing in .env');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
  console.error('ERROR: "commands" folder not found!');
  process.exit(1);
}

const categories = fs.readdirSync(commandsPath);

for (const category of categories) {
  const categoryPath = path.join(commandsPath, category);
  if (!fs.statSync(categoryPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);

    try {
      // Clear cache so deleted/edited commands are reloaded properly
      delete require.cache[require.resolve(filePath)];
      
      const command = require(filePath);

      if (command.data && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());
        console.log(`Loaded: ${command.data.name}`);
      } else {
        console.warn(`Skipped: ${file} (missing data or toJSON)`);
      }
    } catch (error) {
      console.warn(`Failed to load: ${file} → ${error.message}`);
      // Doesn't crash — continues with next file
    }
  }
}

(async () => {
  console.log(`Starting deployment of ${commands.length} slash commands...`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('All slash commands deployed successfully!');
    console.log('Only existing commands will now appear in the / menu.');
    console.log('You can safely delete any command file — it will disappear instantly after next deploy.');
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
})();
