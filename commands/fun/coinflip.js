const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require('discord.js');

const STAFF_ROLE_ID = '1411083330773848194';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('result')
    .setDescription('Send a result message (staff only)'),

  async execute(interaction) {
    // Check if user has the required role
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId('result_modal')
      .setTitle('Send Result Message');

    const messageInput = new TextInputBuilder()
      .setCustomId('message_input')
      .setLabel('Message Content')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const typeInput = new TextInputBuilder()
      .setCustomId('type_input')
      .setLabel('Send as Embed? (yes/no)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Type "yes" for embed, anything else for normal text')
      .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(messageInput);
    const secondRow = new ActionRowBuilder().addComponents(typeInput);

    modal.addComponents(firstRow, secondRow);

    // Show the modal
    await interaction.showModal(modal);
  },
};
