const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removepremium')
    .setDescription('Remove the Premium role from a user')
    .addUserOption(option => option.setName('user').setDescription('The user to remove the role from').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const roleId = '1446923754771841086';
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: 'User not found!', ephemeral: true });
    await member.roles.remove(roleId);
    await interaction.reply({ content: `✅ Removed Premium role from ${member.user.tag}` });
  }
};