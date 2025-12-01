const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Nasl 1 joins the 24/7 voice channel'),

  async execute(interaction) {
    await interaction.deferReply();

    const CHANNEL_ID = '1441136897836453960'; // چنل 24/7 خودت

    const channel = interaction.guild.channels.cache.get(CHANNEL_ID);
    if (!channel || channel.type !== ChannelType.GuildVoice)
      return interaction.editReply('Channel not found!');

    const me = interaction.guild.members.me;
    if (!channel.permissionsFor(me).has(['Connect', 'Speak']))
      return interaction.editReply('I don\'t have permission to join!');

    const old = getVoiceConnection(interaction.guild.id);
    if (old) old.destroy();

    joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    await interaction.editReply(`Joined ${channel} — 24/7 active`);
  },
};
