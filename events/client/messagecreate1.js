const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith('!pick ')) return;

    const session = require('../voice/voiceStateUpdate.js').getSession();
    if (!session) return message.reply('No active picking session!');

    const target = message.mentions.members.first();
    if (!target) return message.reply('Please mention a player! Example: `!pick @Sadeq`');

    if (!session.available.some(p => p.id === target.id))
      return message.reply('This player is not available for picking!');

    if (message.author.id !== session.currentTurn)
      return message.reply(`It's not your turn! Current turn: <@${session.currentTurn}>`);

    // Add player to correct team
    if (session.team1[0].id === message.author.id) {
      session.team1.push(target);
    } else {
      session.team2.push(target);
    }

    session.available = session.available.filter(p => p.id !== target.id);
    session.picksLeft--;
    session.currentTurn = session.team1[0].id === message.author.id ? session.team2[0].id : session.team1[0].id;

    // Update live embed
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Nasl 1 • Live Picking')
      .addFields(
        { name: 'Team 1', value: session.team1.map(m => m.toString()).join('\n'), inline: true },
        { name: 'Team 2', value: session.team2.map(m => m.toString()).join('\n'), inline: true },
        { name: 'Remaining Players', value: session.available.map(m => m.toString()).join('\n') || '—', inline: false },
        { name: 'Next Turn', value: `<@${session.currentTurn}>`, inline: false }
      )
      .setFooter({ text: `${session.picksLeft} picks left` })
      .setTimestamp();

    await session.message.edit({ embeds: [embed] });
    await message.delete().catch(() => {});

    // Picking finished → move players
    if (session.picksLeft === 0) {
      const finalEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Picking Complete!')
        .setDescription('Both teams are ready and moved to their voice channels!');

      await session.textChannel.send({ embeds: [finalEmbed], content: '@everyone' });

      session.team1.forEach(m => m.voice.setChannel(session.game1).catch(() => {}));
      session.team2.forEach(m => m.voice.setChannel(session.game2).catch(() => {}));

      // Clean up after 15 seconds
      setTimeout(() => {
        require('events/voiceStateUpdate1.js').getSession = () => null;
      }, 15000);
    }
  }
};
