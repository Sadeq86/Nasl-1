const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('result')
    .setDescription('Send a custom message as the bot via a menu'),
  async execute(interaction) {
    const STAFF_ROLE_ID = '1411083330773848194';
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('resultModal')
      .setTitle('Nasl-1 Result System');

    const messageInput = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('Message')
      .setPlaceholder('Enter your message here...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const embedInput = new TextInputBuilder()
      .setCustomId('embed')
      .setLabel('Use Embed? (yes/no)')
      .setPlaceholder('yes or no')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const colorInput = new TextInputBuilder()
      .setCustomId('color')
      .setLabel('Embed Color (Hex)')
      .setPlaceholder('#0099ff')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(messageInput),
      new ActionRowBuilder().addComponents(embedInput),
      new ActionRowBuilder().addComponents(colorInput)
    );

    await interaction.showModal(modal);
  }
};