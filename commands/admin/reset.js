const { SlashCommandBuilder } = require('discord.js');
const { RankedScore } = require('../../models/RankedScore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset points for a specific user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to reset points for')
        .setRequired(true)),
  async execute(interaction) {
    const ALLOWED_ROLE_ID = '1437081134206025868';
    if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');

    try {
      await RankedScore.findOneAndUpdate(
        { guildId: interaction.guild.id, userId: targetUser.id },
        { $set: { points: 0 } },
        { upsert: true }
      );

      await interaction.reply({ content: `✅ Successfully reset points for ${targetUser}.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ An error occurred while resetting points.', ephemeral: true });
    }
  }
};
