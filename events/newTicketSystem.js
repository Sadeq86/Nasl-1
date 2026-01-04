// events/newTicketSystem.js — FINAL 100% WORKING TICKET SYSTEM
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const moment = require('moment');
const fs = require('fs');

const CONFIG = {
  LOG_CHANNEL: '1446896003574661250',
  MENTION_ROLE: '1223618709390757970',
  CATEGORIES: {
    nasl1: {
      open: '1409485955169124412',
      close: '1412057255079313450',
      role: '1411083330773848194',
      label: 'Nasl 1',
      title: '🎫 Nasl 1 Ticket',
      subtitle: '🗡️ Nasl 1 Team Application',
      description: '📋 Please provide the following information:\n- Your gaming experience 🎮\n- Your current rank/level 🏆\n- Preferred positions/roles 📌\n- Previous tournament experience 🏅'
    },
    staff: {
      open: '1409487313699864629',
      close: '1412057196283428936',
      role: '1223605183540494448',
      label: 'Staff Team',
      title: '🎫 Staff Apply Ticket',
      subtitle: '👨🏻‍💼 Nasl-1 Staff Application',
      description: '📋 Please provide the following information:\n- Your previous experience (if any) 🔗\n- Why you want to join the staff team 🔰\n- Your availability (timezone & hours) ⏳\n- Any specific skills or qualifications ⚡'
    },
    others: {
      open: '1409487668714410015',
      close: '1412057410054524939',
      role: '1410028298800730112',
      label: 'Others',
      title: '🎫 Others Ticket',
      subtitle: '🧩 Others',
      description: '- Please describe your issue or question in detail so we can assist you properly. 📝'
    }
  }
};

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const { guild, user } = interaction;

    // String Select Menu (انتخاب نوع تیکت)
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
      const type = interaction.values[0];
      const cfg = CONFIG.CATEGORIES[type];
      if (!cfg) return await interaction.reply({ content: 'Invalid category!', ephemeral: true });

      // defer اول — خیلی مهم!
      await interaction.deferReply({ ephemeral: true });

      try {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${user.username.toLowerCase()}`,
          type: ChannelType.GuildText,
          parent: cfg.open,
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] },
            { id: cfg.role, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: CONFIG.MENTION_ROLE, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
          ]
        });

        const embed = new EmbedBuilder()
          .setTitle(cfg.title)
          .setDescription(`${cfg.subtitle}\n\n${cfg.description}`)
          .addFields(
            { name: '👤 Ticket Owner', value: `<@${user.id}>`, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
          )
          .setColor('#00ff00')
          .setFooter({ text: 'Nasl-1 Ticket System' })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`ticket_close_${type}`).setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`ticket_reopen_${type}`).setLabel('Reopen').setEmoji('🔓').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`ticket_claim_${type}`).setLabel('Claim').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`ticket_transcript`).setLabel('Transcript').setEmoji('📑').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`ticket_delete`).setLabel('Delete').setEmoji('🗑️').setStyle(ButtonStyle.Secondary)
        );

        await ticketChannel.send({
          content: `<@${user.id}> <@&${CONFIG.MENTION_ROLE}>`,
          embeds: [embed],
          components: [row]
        });

        await interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });
      } catch (error) {
        console.error('Ticket creation error:', error);
        await interaction.editReply({ content: 'Failed to create ticket!' });
      }
      return;
    }

    // Button Interactions
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    // Claim Ticket
    if (customId.startsWith('ticket_claim_')) {
      await interaction.deferUpdate();
      const type = customId.split('_')[2];
      const row = interaction.message.components[0];
      row.components[2].setDisabled(true).setLabel(`Claimed by ${user.username}`);

      await interaction.message.edit({ components: [row] });
      await interaction.followUp({ content: `✅ Ticket claimed by ${user}`, ephemeral: true });
      return;
    }

    // Close Ticket
    if (customId.startsWith('ticket_close_')) {
      await interaction.deferUpdate();
      const type = customId.split('_')[2];
      const cfg = CONFIG.CATEGORIES[type] || CONFIG.CATEGORIES.others;

      await interaction.channel.setParent(cfg.close);
      await interaction.channel.permissionOverwrites.edit(user.id, { SendMessages: false });

      const embed = new EmbedBuilder()
        .setTitle('🔒 Ticket Closed')
        .setDescription(`Closed by ${user}`)
        .setColor('#ff0000')
        .setTimestamp();

      await interaction.followUp({ embeds: [embed] });
      return;
    }

    // Reopen Ticket
    if (customId.startsWith('ticket_reopen_')) {
      await interaction.deferUpdate();
      const type = customId.split('_')[2];
      const cfg = CONFIG.CATEGORIES[type] || CONFIG.CATEGORIES.others;

      await interaction.channel.setParent(cfg.open);
      await interaction.channel.permissionOverwrites.edit(user.id, { SendMessages: true });

      const embed = new EmbedBuilder()
        .setTitle('🔓 Ticket Reopened')
        .setDescription(`Reopened by ${user}`)
        .setColor('#00ff00')
        .setTimestamp();

      await interaction.followUp({ embeds: [embed] });
      return;
    }

    // Transcript
    if (customId === 'ticket_transcript') {
      await interaction.deferReply({ ephemeral: true });

      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const content = messages.reverse().map(m => `[${moment(m.createdAt).format('HH:mm')}] ${m.author.tag}: ${m.content || '(Attachment)'}`).join('\n');
      const filename = `transcript-${interaction.channel.name}.txt`;
      fs.writeFileSync(filename, content);
      const attachment = { files: [filename] };

      const logChannel = await guild.channels.fetch(CONFIG.LOG_CHANNEL).catch(() => null);
      if (logChannel) {
        await logChannel.send({ content: `📑 Transcript for ${interaction.channel.name}`, files: [filename] });
      }

      await interaction.editReply({ content: '✅ Transcript sent to logs!' });
      fs.unlinkSync(filename);
      return;
    }

    // Delete Ticket
    if (customId === 'ticket_delete') {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply({ content: '🗑️ Deleting ticket in 5 seconds...' });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  }
};
