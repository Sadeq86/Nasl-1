const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removepit')
    .setDescription('Remove the PIT role from a user')
    .addUserOption(option => option.setName('user').setDescription('The user to remove the role from').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const roleId = '1457034748017905868';
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: 'User not found!', ephemeral: true });
    await member.roles.remove(roleId);
    await interaction.reply({ content: `✅ Removed PIT role from ${member.user.tag}` });
  }
};