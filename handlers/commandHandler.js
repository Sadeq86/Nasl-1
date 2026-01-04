const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();
  const commandsPath = path.join(__dirname, '../commands');
  const commandCategories = fs.readdirSync(commandsPath);

  for (const category of commandCategories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
      try {
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);

      
        if (!command || !command.data || typeof command.data.name !== 'string') {
          console.error(`[Command] Invalid command in ${file} (${category}): Missing 'data' or 'data.name'`);
          continue;
        }

        client.commands.set(command.data.name, { ...command, category });
        console.log(`[Command] Loaded: ${command.data.name} (${category})`);
      } catch (error) {
        console.error(`[Command] Failed to load ${file} (${category}):`, error.message);
      }
    }
  }
};
