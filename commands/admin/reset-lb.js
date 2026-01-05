const { SlashCommandBuilder } = require('discord.js');
const { RankedScore } = require('../../models/RankedScore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset-lb')
    .setDescription('Reset the entire ranked leaderboard'),
  async execute(interaction) {
    const ALLOWED_ROLE_ID = '1437081134206025868';
    if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    try {
      await RankedScore.deleteMany({ guildId: interaction.guild.id });
      await interaction.reply({ content: '✅ Successfully reset the ranked leaderboard for this server.', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ An error occurred while resetting the leaderboard.', ephemeral: true });
    }
  }
};
