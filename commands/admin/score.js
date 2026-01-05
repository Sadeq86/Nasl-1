const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('score')
    .setDescription('Set score for a game'),
  async execute(interaction) {
    const ALLOWED_ROLE_ID = '1437081134206025868';
    if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('scoreModal')
      .setTitle('Game Result Entry');

    const teamRoleInput = new TextInputBuilder()
      .setCustomId('teamRole')
      .setLabel('Winning Team Role ID')
      .setPlaceholder('Enter role ID of the winning team')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const playersInput = new TextInputBuilder()
      .setCustomId('players')
      .setLabel('Winning Players IDs (Space separated)')
      .setPlaceholder('ID1 ID2 ID3 ID4 [ID5]')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const teamViewLinkInput = new TextInputBuilder()
      .setCustomId('teamViewLink')
      .setLabel('Team View Link')
      .setPlaceholder('https://...')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(teamRoleInput),
      new ActionRowBuilder().addComponents(playersInput),
      new ActionRowBuilder().addComponents(teamViewLinkInput)
    );

    await interaction.showModal(modal);
  }
};
