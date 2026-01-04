const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'sayModal' || interaction.customId === 'resultModal') {
      try {
        const message = interaction.fields.getTextInputValue('message');
        const embedOption = interaction.fields.getTextInputValue('embed').toLowerCase();
        const color = interaction.fields.getTextInputValue('color') || '#0099ff';
        const useEmbed = embedOption === 'yes' || embedOption === 'y' || embedOption === 'true';

        const channel = interaction.channel;
        if (!channel) return;

        if (useEmbed) {
          const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(message)
            .setFooter({ text: '🎟️ | Nasl-1 System' });
          await channel.send({ embeds: [embed] });
        } else {
          await channel.send(message);
        }
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '✅ Message sent!', ephemeral: true }).catch(() => {});
        }
      } catch (error) {
        // Silent catch for interaction already acknowledged
        if (error.code !== 40060 && error.code !== 10062) {
          console.error('Modal Error:', error);
        }
      }
      return;
    }

    if (interaction.customId !== 'embed_builder') return;

    try {
      const title = interaction.fields.getTextInputValue('embed_title');
      const description =
        interaction.fields.getTextInputValue('embed_description');
      const color = interaction.fields.getTextInputValue('embed_color');
      const authorInput = interaction.fields.getTextInputValue('embed_author');
      const fieldsInput = interaction.fields.getTextInputValue('embed_fields');

      const embed = new EmbedBuilder()
        .setDescription(description)
        .setTimestamp();

      if (title) embed.setTitle(title);
      if (color) embed.setColor(color);

      if (authorInput) {
        const [authorName, authorUrl, authorIconUrl] = authorInput.split('|');
        embed.setAuthor({
          name: authorName,
          url: authorUrl || null,
          iconURL: authorIconUrl || null,
        });
      }

      if (fieldsInput && fieldsInput.trim()) {
        const fields = fieldsInput.split('\n').map((field) => {
          const [name, value, inline] = field.split('|');
          return {
            name: name || '\u200b',
            value: value || '\u200b',
            inline: inline === 'true',
          };
        });
        embed.addFields(fields);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error creating embed:', error);
      await interaction.reply({
        content: 'Error creating embed. Check your inputs and try again.',
        ephemeral: true,
      });
    }
  },
};
