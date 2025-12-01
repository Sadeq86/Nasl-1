const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Nasl-1 will join the fixed 24/7 voice channel'),

  async execute(interaction) {
    await interaction.deferReply();

    
    const FIXED_CHANNEL_ID = '1441136897836453960';

    const channel = interaction.guild.channels.cache.get(FIXED_CHANNEL_ID);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      return interaction.editReply({ content: 'Fixed voice channel not found!' });
    }

    if (!channel.permissionsFor(interaction.guild.members.me).has(['Connect', 'Speak'])) {
      return interaction.editReply({ content: 'I don\'t have permission to join this channel!' });
    }

    // اگه قبلاً تو چنل دیگه بود، خارج شو
    const oldConnection = getVoiceConnection(interaction.guild.id);
    if (oldConnection) oldConnection.destroy();

    // جوین به چنل
    joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    await interaction.editReply({ content: `Successfully joined ${channel}! 24/7 mode active` });
  },
};
