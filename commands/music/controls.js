const {
  SlashCommandBuilder,
  ChannelType,
} = require('discord.js');
const {
  joinVoiceChannel,
  getVoiceConnection,
} = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controls')
    .setDescription('Voice channel controls')
    .addSubcommand((sub) =>
      sub.setName('join').setDescription('Bot joins your current voice channel (24/7)')
    )
    .addSubcommand((sub) =>
      sub.setName('leave').setDescription('Bot leaves the voice channel')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const memberVoiceChannel = interaction.member.voice.channel;
    const subcommand = interaction.options.getSubcommand();

    // ===================== JOIN =====================
    if (subcommand === 'join') {
      if (!memberVoiceChannel) {
        return interaction.editReply({
          content: 'You must be in a voice channel first!',
          ephemeral: true,
        });
      }

      if (memberVoiceChannel.type !== ChannelType.GuildVoice) {
        return interaction.editReply({
          content: 'I can only join normal voice channels!',
          ephemeral: true,
        });
      }

      // If bot is already in another channel → leave it first
      const oldConnection = getVoiceConnection(interaction.guild.id);
      if (oldConnection) {
        oldConnection.destroy();
      }

      // Join the user's voice channel
      joinVoiceChannel({
        channelId: memberVoiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true,   // Deafened (recommended for 24/7 bots)
        selfMute: false,  // Not muted (can play music if needed)
      });

      return interaction.editReply({
        content: `Joined ${memberVoiceChannel} — I'm here 24/7 until you say /controls leave`,
      });
    }

    // ===================== LEAVE =====================
    if (subcommand === 'leave') {
      const connection = getVoiceConnection(interaction.guild.id);

      if (!connection) {
        return interaction.editReply({
          content: "I'm not in any voice channel!",
          ephemeral: true,
        });
      }

      connection.destroy();
      return interaction.editReply({
        content: 'Left the voice channel. See you next time!',
      });
    }
  },
};
