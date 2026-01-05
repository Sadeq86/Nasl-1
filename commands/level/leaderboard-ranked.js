const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RankedScore } = require('../../models/RankedScore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top 10 ranked players'),
  async execute(interaction) {
    try {
      const topPlayers = await RankedScore.find({ guildId: interaction.guild.id })
        .sort({ points: -1 })
        .limit(10);

      if (topPlayers.length === 0) {
        return interaction.reply({ content: 'No players in the leaderboard yet.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 | Ranked Leaderboard')
        .setColor('Gold')
        .setDescription(
          topPlayers
            .map((p, i) => `**${i + 1}.** <@${p.userId}> • \`${p.points}\` Points`)
            .join('\n')
        )
        .setFooter({ text: 'Nasl-1 Ranking System' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'An error occurred while fetching the leaderboard.', ephemeral: true });
    }
  }
};
