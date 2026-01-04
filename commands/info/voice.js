const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Joins a specific voice channel for 24/7 presence')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const channelId = '1328645767564492800';
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== 2) { // 2 is GuildVoice
      return interaction.reply({ content: '❌ Could not find the specified voice channel!', ephemeral: true });
    }

    try {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      await interaction.reply({ content: `✅ Joined <#${channel.id}> for 24/7 presence!`, ephemeral: true });
    } catch (error) {
      console.error('Error joining voice channel:', error);
      await interaction.reply({ content: '❌ Failed to join the voice channel.', ephemeral: true });
    }
  },
};
