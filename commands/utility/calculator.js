const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Nasl-1 Will join a fixed voice channel.'),

  async execute(interaction) {
    await interaction.deferReply();

    
    const FIXED_CHANNEL_ID = '1441136897836453963'; 

    const channel = interaction.guild.channels.cache.get(FIXED_CHANNEL_ID);

    if (!channel || channel.type !== 2) {
      return interaction.editReply({ content: 'Channel Not Found.' });
    }

    
    if (!channel.permissionsFor(interaction.guild.members.me).has(['Connect', 'Speak'])) {
      return interaction.editReply({ content: 'I dont have access to join this channel.' });
    }

    
    const oldConnection = getVoiceConnection(interaction.guild.id);
    if (oldConnection) oldConnection.destroy();

    
    joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    await interaction.editReply({ content: ` ${channel} I joined.` });
  },
};
