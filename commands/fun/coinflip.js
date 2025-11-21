const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Spin a wheel and see the result.'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? '🎰 Random' : '🫳 Picking';

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎲 Picker Wheel')
      .setDescription(`You spin the wheel.`)
      .addFields(
        { name: 'Result', value: result, inline: true },
        {
          name: 'Requested by',
          value: `${interaction.user.tag}`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
