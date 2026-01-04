const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpugs')
    .setDescription('Add the PUGS role to a user')
    .addUserOption(option => option.setName('user').setDescription('The user to add the role to').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const roleId = '1446923702607544532';
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: 'User not found!', ephemeral: true });
    await member.roles.add(roleId);
    await interaction.reply({ content: `✅ Added PUGS role to ${member.user.tag}` });
  }
};