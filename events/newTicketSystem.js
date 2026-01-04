const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const moment = require('moment');

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
      description: '- Please describe your issue or question in detail so we can assist you properly.  📝'
    }
  }
};

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const { guild, user, channel } = interaction;

    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
      const type = interaction.values[0];
      const cfg = CONFIG.CATEGORIES[type];
      if (!cfg) return;

      await interaction.deferReply({ ephemeral: true });

      const ticketChannel = await guild.channels.create({
        name: `ticket-${user.username}`,
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
          { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:t>`, inline: true }
        )
        .setColor('Blue')
        .setFooter({ text: '📩 Nasl-1 Ticket System' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ticket_close_${type}_${user.id}`).setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`ticket_reopen_${type}_${user.id}`).setLabel('Reopen').setEmoji('🔓').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`ticket_claim_${type}`).setLabel('Claim').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Warning),
        new ButtonBuilder().setCustomId(`ticket_transcript_${user.id}`).setLabel('Transcript').setEmoji('📑').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`ticket_delete`).setLabel('Delete').setEmoji('⛔').setStyle(ButtonStyle.Secondary)
      );

      await ticketChannel.send({ 
        content: `<@${user.id}> <@&${CONFIG.MENTION_ROLE}>`, 
        embeds: [embed], 
        components: [row] 
      });

      await interaction.editReply(`✅ Ticket created: ${ticketChannel}`);
      return;
    }

    if (interaction.isButton()) {
      const { customId } = interaction;
      
      if (customId.startsWith('ticket_claim_')) {
        const type = customId.split('_')[2];
        const oldRow = interaction.message.components[0];
        const newRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('claimed').setLabel(`Claimed by ${user.username}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
          oldRow.components.find(c => c.customId.startsWith('ticket_close_'))
        );
        await interaction.message.edit({ components: [newRow] });
        await interaction.reply({ content: `✅ Ticket claimed by ${user}` });
        return;
      }

      if (customId.startsWith('ticket_close_')) {
        const [,, type, openerId] = customId.split('_');
        const cfg = CONFIG.CATEGORIES[type] || CONFIG.CATEGORIES.others;
        
        await interaction.channel.setParent(cfg.close).catch(() => {});
        await interaction.channel.permissionOverwrites.edit(openerId, { SendMessages: false }).catch(() => {});

        const embed = new EmbedBuilder()
          .setTitle('🎫 Ticket Closed')
          .setDescription('Ticket has been closed. Please use the buttons below to manage.')
          .setColor('Red')
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`ticket_reopen_${type}_${openerId}`).setLabel('Reopen').setEmoji('🔓').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`ticket_transcript_${openerId}`).setLabel('Transcript').setEmoji('📑').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`ticket_delete`).setLabel('Delete').setEmoji('⛔').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
        return;
      }

      if (customId.startsWith('ticket_reopen_')) {
        const [,, type, openerId] = customId.split('_');
        const cfg = CONFIG.CATEGORIES[type] || CONFIG.CATEGORIES.others;
        
        await interaction.channel.setParent(cfg.open).catch(() => {});
        await interaction.channel.permissionOverwrites.edit(openerId, { SendMessages: true }).catch(() => {});

        const embed = new EmbedBuilder()
          .setTitle('🎫 Ticket Reopened')
          .setDescription(`Ticket has been reopened by ${user}.`)
          .setColor('Green')
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
      }

      if (customId === 'ticket_delete') {
        const embed = new EmbedBuilder()
          .setTitle('⛔ Deleting Ticket')
          .setDescription('This ticket will be deleted in 5 seconds...')
          .setColor('Black')
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        return;
      }

      if (customId.startsWith('ticket_transcript_')) {
        const openerId = customId.split('_')[2];
        await interaction.deferReply({ ephemeral: true });
        
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const content = messages.reverse().map(m => `[${moment(m.createdAt).format('HH:mm')}] ${m.author.tag}: ${m.content}`).join('\n');
        const filename = `transcript-${interaction.channel.name}.txt`;
        fs.writeFileSync(filename, content);
        const attachment = new AttachmentBuilder(filename);

        const logChannel = await guild.channels.fetch(CONFIG.LOG_CHANNEL).catch(() => null);
        if (logChannel) {
          await logChannel.send({ 
            content: `📑 Transcript for ${interaction.channel.name} (Opened by <@${openerId}>)`, 
            files: [attachment] 
          });
        }
        
        const opener = await guild.members.fetch(openerId).catch(() => null);
        if (opener) {
          await opener.send({ 
            content: `📑 Transcript for your ticket: ${interaction.channel.name}`, 
            files: [attachment] 
          }).catch(() => {});
        }
        
        await interaction.editReply('✅ Transcript sent to log channel and user DM!');
        fs.unlinkSync(filename);
      }
    }
  }
};