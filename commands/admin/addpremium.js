const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpremium')
    .setDescription('Add the Premium role to a user')
    .addUserOption(option => option.setName('user').setDescription('The user to add the role to').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const roleId = '1446923754771841086';
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: 'User not found!', ephemeral: true });
    await member.roles.add(roleId);
    await interaction.reply({ content: `✅ Added Premium role to ${member.user.tag}` });
  }
};