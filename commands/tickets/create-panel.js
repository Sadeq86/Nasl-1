// commands/tickets/createpanel.js — 100% WORKING
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpanel')
    .setDescription('Create a ticket panel'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Ticket System')
      .setDescription('Click the button below to open a ticket!')
      .setFooter({ text: 'Nasl-1 System' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('open_ticket')  // این customId خیلی مهمه
          .setLabel('Open Ticket')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎫')
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
