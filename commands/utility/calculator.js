const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join a voice channel and stay 24/7')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The voice channel to join')
        .setRequired(true)
        .addChannelTypes(2) 
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!channel.isVoiceBased()) {
      return interaction.reply({ content: 'Please select a valid voice channel!', ephemeral: true });
    }

    if (interaction.guild.members.me.voice.channelId) {
      return interaction.reply({ content: `I'm already in a voice channel!`, ephemeral: true });
    }

    try {
      const connection = await channel.joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true,   
        selfMute: false,  
      });

      
      connection.on('stateChange', (oldState, newState) => {
        if (newState.status === 'disconnected') {
         
          setTimeout(() => channel.joinVoiceChannel({ ...connection.joinConfig }), 5000);
        }
      });

      await interaction.reply({ content: `Joined ${channel} and staying 24/7!`, ephemeral: false });
    } catch (error) {
      console.error('Join error:', error);
      await interaction.reply({ content: 'Failed to join the voice channel.', ephemeral: true });
    }
  },
};
