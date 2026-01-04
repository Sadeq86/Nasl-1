const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Setup the ticket system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎫 Support Ticket System')
      .setDescription('Make A Selection To Create A Ticket 🏷️\n﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌\n👨‍💼 **Staff Apply**\n🛡️ Apply for staff team\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🏆 **Nasl 1**\n🥇 Join Team Nasl 1\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n❓ **Other**\n🧩 Other issues and \n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬')
      .setColor('Blue')
      .setFooter({ text: '📩 Nasl-1 Ticket System' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select')
      .setPlaceholder('Make a selection')
      .addOptions([
        {
          label: 'Staff Apply',
          description: 'Apply for staff team',
          value: 'staff',
          emoji: '👨‍💼',
        },
        {
          label: 'Nasl 1',
          description: 'Join Team Nasl 1',
          value: 'nasl1',
          emoji: '🏆',
        },
        {
          label: 'Other',
          description: 'Other issues',
          value: 'others',
          emoji: '❓',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Ticket system setup!', ephemeral: true });
  }
};