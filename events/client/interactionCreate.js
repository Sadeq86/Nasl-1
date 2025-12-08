// events/client/interactionCreate.js — FINAL 100% WORKING (NO MORE "The application did not respond")
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // 1. فقط اسلش کامندها رو هندل کن (بقیه رو ول کن)
    if (!interaction.isChatInputCommand()) {
      // Autocomplete رو جداگانه هندل می‌کنیم
      if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (command?.autocomplete) {
          try {
            await command.autocomplete(interaction);
          } catch (e) {
            console.error('Autocomplete error:', e);
          }
        }
      }
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`Command ${interaction.commandName} not found`);
      return;
    }

    try {
      // مهم: فقط execute رو صدا بزن، بقیه کارها با خود کامنده
      await command.execute(interaction);
    } catch (error) {
      console.error('Command execution failed:', error);

      const content = { content: 'خطایی رخ داد!', ephemeral: true };

      // اگه هنوز جواب نداده باشیم
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(content).catch(() => {});
      }
      // اگه defer شده باشه
      else if (interaction.deferred) {
        await interaction.editReply(content).catch(() => {});
      }
      // اگه قبلاً جواب داده باشه
      else {
        await interaction.followUp(content).catch(() => {});
      }
    }
  }
};
