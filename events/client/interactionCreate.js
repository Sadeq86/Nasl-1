// events/client/interactionCreate.js — FINAL TICKET + MUSIC + EVERYTHING WORKING
const { Events, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Command error:', error);
        const reply = { content: 'An error occurred!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
      return;
    }

    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      }
      return;
    }

    // Button: Open Ticket
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
      await interaction.deferReply({ ephemeral: true });

      // چک کردن دسترسی بات
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.editReply({ content: 'I need "Manage Channels" permission!' });
      }

      // ساخت کانال تیکت
      try {
        const ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          parent: 'YOUR_CATEGORY_ID_HERE', // آیدی کتگوری تیکت رو اینجا بذار
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: interaction.guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
          ]
        });

        const welcomeEmbed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Ticket Created')
          .setDescription(`Hello ${interaction.user}! Your ticket has been created.\nPlease explain your issue.`)
          .setTimestamp();

        await ticketChannel.send({ content: `${interaction.user}`, embeds: [welcomeEmbed] });
        await interaction.editReply({ content: `Ticket created: ${ticketChannel}` });

      } catch (error) {
        console.error('Ticket creation failed:', error);
        await interaction.editReply({ content: 'Failed to create ticket!' });
      }
    }
  }
};
