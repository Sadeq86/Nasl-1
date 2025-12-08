// events/client/interactionCreate.js — FINAL CLEAN & WORKING
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Command error:', error);
        const reply = { content: 'There is a problem.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }

    else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
          // نیازی به respond نیست، دیسکورد خودش می‌فهمه
        }
      }
    }

    // دکمه و منو (برای تیکت و چیزای دیگه)
    else if (interaction.isButton() || interaction.isStringSelectMenu()) {
      // اینجا بعداً هندلر دکمه اضافه می‌کنیم، فعلاً فقط خطا نده
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.deferUpdate().catch(() => {});
        }
      } catch (e) {}
    }
  },
};
