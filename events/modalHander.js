const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'scoreModal') {
      try {
        const { RankedScore, RankedGame } = require('../models/RankedScore');
        const teamRole = interaction.fields.getTextInputValue('teamRole');
        const playersRaw = interaction.fields.getTextInputValue('players');
        const teamViewLink = interaction.fields.getTextInputValue('teamViewLink');
        const RESULT_CHANNEL_ID = '1437083733139263590';

        const playerIds = playersRaw.trim().split(/\s+/);
        const winners = playerIds.slice(0, 4);
        const sub = playerIds.length >= 5 ? playerIds[4] : '-';

        // Increment Game Number
        let gameData = await RankedGame.findOne({ guildId: interaction.guild.id }).sort({ gameNumber: -1 });
        const gameNumber = gameData ? gameData.gameNumber + 1 : 1;
        await RankedGame.create({ guildId: interaction.guild.id, gameNumber });

        const pointsList = [20, 30, 40, 50, 60, 70];
        const getRandomPoint = () => pointsList[Math.floor(Math.random() * pointsList.length)];

        const winnersDisplay = [];
        for (let i = 0; i < 4; i++) {
          const userId = winners[i] || 'Unknown';
          const points = getRandomPoint();
          if (winners[i]) {
            await RankedScore.findOneAndUpdate(
              { guildId: interaction.guild.id, userId },
              { $inc: { points: points } },
              { upsert: true }
            );
          }
          winnersDisplay.push(`👤 ${i + 1}st • <@${userId}> \`${points}\``);
        }

        let subDisplay = '-';
        if (sub !== '-') {
          const points = getRandomPoint();
          await RankedScore.findOneAndUpdate(
            { guildId: interaction.guild.id, userId: sub },
            { $inc: { points: points } },
            { upsert: true }
          );
          subDisplay = `<@${sub}> \`${points}\``;
        }

        const embed = new EmbedBuilder()
          .setTitle(`📊 Game Result #${gameNumber} 🎮`)
          .setColor('Green')
          .setDescription(
            `👑 <@&${teamRole}>\n\n` +
            `**Winners 🥇 :**\n` +
            winnersDisplay.join('\n') + `\n` +
            `🔗 **Sub •** ${subDisplay}\n\n` +
            `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
            `🔗 **Team View •** [Click Here](${teamViewLink})`
          )
          .setFooter({ text: 'Nasl-1 Ranked System' });

        const channel = await interaction.guild.channels.fetch(RESULT_CHANNEL_ID);
        if (channel) {
          await channel.send({ embeds: [embed] });
          await interaction.reply({ content: '✅ Result sent successfully!', ephemeral: true });
        } else {
          await interaction.reply({ content: '❌ Could not find result channel.', ephemeral: true });
        }
      } catch (error) {
        console.error('Score Modal Error:', error);
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
      }
      return;
    }

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
