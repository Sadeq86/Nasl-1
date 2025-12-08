// events/client/interactionCreate.js — FINAL CLEAN VERSION
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Command error:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred!', ephemeral: true }).catch(() => {});
        }
      }
      return;
    }

    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      }
      return;
    }
  }
};
