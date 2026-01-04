const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpups')
    .setDescription('Add the PUPS role to a user')
    .addUserOption(option => option.setName('user').setDescription('The user to add the role to').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const roleId = '1446923540246036692';
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: 'User not found!', ephemeral: true });
    await member.roles.add(roleId);
    await interaction.reply({ content: `✅ Added PUPS role to ${member.user.tag}` });
  }
};