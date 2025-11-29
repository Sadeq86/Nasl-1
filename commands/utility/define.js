const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the current voice channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

  async execute(interaction) {
    const connection = interaction.guild.members.me.voice;

    if (!connection.channelId) {
      return interaction.reply({ content: 'I'm not in any voice channel!', ephemeral: true });
    }

    try {
      connection.disconnect();
      connection.destroy();

      await interaction.reply({ content: `Left ${connection.channel}!`, ephemeral: false });
    } catch (error) {
      console.error('Leave error:', error);
      await interaction.reply({ content: 'Failed to leave the voice channel.', ephemeral: true });
    }
  },
};
