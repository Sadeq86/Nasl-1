// events/client/interactionCreate.js — FINAL 100% WORKING VERSION
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;

    // اسلش کامندها
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Command execution error:', error);
        const reply = { content: 'There was an error while executing this command!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }

    // Autocomplete
    else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      }
    }

    // دکمه‌ها (مثل تیکت)
    else if (interaction.isButton()) {
      const handler = client.buttonHandlers?.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction);
        } catch (error) {
          console.error('Button handler error:', error);
        }
      }
    }

    // منوها (Select Menu)
    else if (interaction.isStringSelectMenu()) {
      const handler = client.selectMenuHandlers?.get(interaction.customId);
      if (handler) {
        try {
          await handler(interaction);
        } catch (error) {
          console.error('Select menu handler error:', error);
        }
      }
    }
  },
};
