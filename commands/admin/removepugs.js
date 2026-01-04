const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removepugs')
    .setDescription('Remove the PUGS role from a user')
    .addUserOption(option => option.setName('user').setDescription('The user to remove the role from').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const roleId = '1446923702607544532';
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: 'User not found!', ephemeral: true });
    await member.roles.remove(roleId);
    await interaction.reply({ content: `✅ Removed PUGS role from ${member.user.tag}` });
  }
};