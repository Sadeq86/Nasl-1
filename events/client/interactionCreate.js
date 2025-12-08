// events/client/interactionCreate.js — FINAL TICKET WORKING 100%
const { Events, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (e) { console.error(e); }
      return;
    }

    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try { await command.autocomplete(interaction); } catch (e) {}
      }
      return;
    }

    // Button Click — Create Ticket
    if (interaction.isButton() && interaction.customId === 'create_ticket') {
      await interaction.deferReply({ ephemeral: true });

      // Check bot permissions
      if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.editReply({ content: 'I need **Manage Channels** permission!' });
      }

      const channelName = `ticket-${interaction.user.username.toLowerCase()}`;

      // Prevent duplicate ticket
      if (interaction.guild.channels.cache.find(ch => ch.name === channelName)) {
        return interaction.editReply({ content: 'You already have an open ticket!' });
      }

      try {
        const ticketChannel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: '1223294184459600093', // آیدی کتگوری تیکت رو اینجا بذار
          permissionOverwrites: [
            { id: interaction.guild.id, deny: ['ViewChannel'] },
            { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
            { id: interaction.guild.members.me.id, allow: ['ViewChannel', 'SendMessages', 'ManageMessages'] }
          ]
        });

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('Ticket Created')
          .setDescription(`Welcome ${interaction.user}!\nPlease explain your issue. Staff will be with you shortly.`)
          .setTimestamp();

        await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed] });
        await interaction.editReply({ content: `Ticket created! ${ticketChannel}` });

      } catch (error) {
        console.error('Ticket error:', error);
        await interaction.editReply({ content: 'Failed to create ticket!' });
      }
    }
  }
};
