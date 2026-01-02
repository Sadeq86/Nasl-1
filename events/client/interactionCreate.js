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

      const content = { content: 'There Is A Problem.', ephemeral: true };

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
// result
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    // Your existing command handling...
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'result_modal') {
      // Optional: re-check role (for safety)
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({
          content: 'You no longer have permission to use this.',
          ephemeral: true,
        });
      }

      const messageContent = interaction.fields.getTextInputValue('message_input');
      const typeChoice = interaction.fields.getTextInputValue('type_input').trim().toLowerCase();

      if (typeChoice === 'yes') {
        // Send as embed
        const embed = new EmbedBuilder()
          .setDescription(messageContent)
          .setColor('#0099ff') // You can change the color
          .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
      } else {
        // Send as normal text
        await interaction.channel.send(messageContent);
      }

      // Confirm to the staff member
      await interaction.reply({
        content: 'Message sent successfully!',
        ephemeral: true,
      });
    }
  }
});
