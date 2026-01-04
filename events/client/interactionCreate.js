
const { Events, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        if (error.code === 10062) return; // Ignore Unknown Interaction (usually modal show timeout)
        console.error(error);
        const errorMessage = { content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage).catch(() => {});
        } else {
          await interaction.reply(errorMessage).catch(() => {});
        }
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'sayModal' || interaction.customId === 'resultModal') {
        try {
          const message = interaction.fields.getTextInputValue('message');
          const embedOption = interaction.fields.getTextInputValue('embed').toLowerCase();
          const color = interaction.fields.getTextInputValue('color') || '#0099ff';
          const useEmbed = embedOption === 'yes' || embedOption === 'y' || embedOption === 'true';

          if (useEmbed) {
            const embed = new EmbedBuilder()
              .setColor(color)
              .setDescription(message)
              .setFooter({ text: '🎟️ | Nasl-1 System' });
            await interaction.channel.send({ embeds: [embed] });
          } else {
            await interaction.channel.send(message);
          }
          await interaction.reply({ content: '✅ Message sent!', flags: [MessageFlags.Ephemeral] });
        } catch (error) {
          console.error('Modal Error:', error);
          if (!interaction.replied) {
            await interaction.reply({ content: '❌ Error sending message.', flags: [MessageFlags.Ephemeral] });
          }
        }
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command && command.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
          await interaction.respond([]);
        }
      }
    }
  }
};
