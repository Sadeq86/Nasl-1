const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Welcome = require('../../models/Welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Configure welcome message')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Welcome channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message (use {member} and {server})')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const text = interaction.options.getString('message') || 'Welcome {member} to {server}!';

    await Welcome.findOneAndUpdate(
      { serverId: interaction.guild.id },
      { enabled: true, channelId: channel.id, description: text },
      { upsert: true, new: true }
    );

    await interaction.reply({
      content: `Welcome system enabled!\nChannel: ${channel}\nMessage: \`${text}\``,
      ephemeral: true
    });
  }
};
