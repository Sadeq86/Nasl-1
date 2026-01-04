// events/giveawayHandler.js
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function endGiveaway(client, giveaway) {
  if (giveaway.ended) return;
  giveaway.ended = true;

  const channel = client.channels.cache.get(giveaway.channelId);
  if (!channel) return;

  const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
  if (!message) return;

  let winners = [];
  if (giveaway.entered.length >= giveaway.winners) {
    const shuffled = giveaway.entered.sort(() => 0.5 - Math.random());
    winners = shuffled.slice(0, giveaway.winners);
  } else if (giveaway.entered.length > 0) {
    winners = giveaway.entered;
  }

  const winnerText = winners.length > 0 ? winners.join(', ') : 'No one entered 😦';

  const endEmbed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(`🎉 ${giveaway.prize} Giveaway Ended`)
    .addFields(
      { name: '🏆 Winners', value: winnerText, inline: true },
      { name: '🎁 Prize', value: giveaway.prize, inline: true },
      { name: '👥 Entries', value: `${giveaway.entered.length}`, inline: true },
      { name: '⏰ Status', value: '🔴 Ended', inline: true },
      { name: '🎮 Host', value: `<@${giveaway.host || 'Unknown'}>`, inline: true },
      { name: '⏰ Ended', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setFooter({ text: '🎉 Nasl-1 Giveaway System' })
    .setTimestamp();

  const disabledButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('giveaway_enter')
      .setLabel('Giveaway Ended')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
      .setEmoji('🎉')
  );

  await message.edit({ embeds: [endEmbed], components: [disabledButton] });

  if (winners.length > 0) {
    await channel.send(`🎉 Congratulations ${winners}! You won **${giveaway.prize}**!`);
  } else {
    await channel.send(`😦 No valid entries, so no one won **${giveaway.prize}**!`);
  }
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'giveaway_enter') return;

    const giveaway = interaction.client.giveaways?.find(g => g.messageId === interaction.message.id && !g.ended);
    if (!giveaway) {
      return interaction.reply({ content: 'This giveaway has ended or does not exist!', ephemeral: true });
    }

    if (giveaway.entered.includes(interaction.user.id)) {
      return interaction.reply({ content: 'You have already entered this giveaway!', ephemeral: true });
    }

    giveaway.entered.push(interaction.user.id);

    await interaction.reply({ content: 'You have successfully entered the giveaway!', ephemeral: true });

    // Update entries count
    const msg = await interaction.channel.messages.fetch(giveaway.messageId);
    const embed = msg.embeds[0];
    const updatedEmbed = EmbedBuilder.from(embed)
      .spliceFields(2, 1, { name: '👥 Entries', value: `${giveaway.entered.length}`, inline: true });

    await msg.edit({ embeds: [updatedEmbed] });
  }
};

// Export endGiveaway for use in command
module.exports.endGiveaway = endGiveaway;
