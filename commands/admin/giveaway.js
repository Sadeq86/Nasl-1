// commands/giveaway/giveaway-start.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-start')
    .setDescription('Start a new giveaway')
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Giveaway duration (e.g. 1h, 30m, 1d)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
        .setMinValue(1))
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the giveaway (default: current channel)')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const duration = interaction.options.getString('duration');
    const winners = interaction.options.getInteger('winners');
    const prize = interaction.options.getString('prize');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const endTime = Date.now() + ms(duration);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`🎉 ${prize} Nasl-1 Giveaway`)
      .addFields(
        { name: '🏆 Winners', value: `${winners}`, inline: true },
        { name: '🎁 Prize', value: prize, inline: true },
        { name: '👥 Entries', value: '0', inline: true },
        { name: '⏰ Status', value: '🟢 Running', inline: true },
        { name: '🎮 Host', value: `${interaction.user}`, inline: true },
        { name: '⏰ Ends', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: '🎉 Nasl-1 Giveaway System' })
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('Enter Giveaway')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎉')
    );

    const message = await channel.send({
      content: '🎉 **NEW GIVEAWAY!** 🎉',
      embeds: [embed],
      components: [button]
    });

    await interaction.editReply({ content: `Giveaway started in ${channel}!` });

    // Save giveaway data (you can use a DB or simple Map)
    const giveaway = {
      messageId: message.id,
      channelId: channel.id,
      guildId: interaction.guild.id,
      endTime,
      prize,
      winners,
      entered: [],
      ended: false
    };

    // Store in client (for simple use)
    if (!interaction.client.giveaways) interaction.client.giveaways = [];
    interaction.client.giveaways.push(giveaway);

    // Set timeout to end giveaway
    setTimeout(() => endGiveaway(interaction.client, giveaway), ms(duration));
  }
};
