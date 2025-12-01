const { Events, EmbedBuilder, Colors } = require('discord.js');
const { pickingSession } = require('../voice/voiceStateUpdate');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith('!pick')) return;

    if (!pickingSession) {
      return message.reply('No active picking session!');
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply('Mention a player! Example: `!pick @Sadeq`');

    if (!pickingSession.available.some(p => p.id === target.id)) {
      return message.reply('This player is not available for picking!');
    }

    if (message.author.id !== pickingSession.currentTurn) {
      return message.reply(`It's not your turn! Current turn: <@${pickingSession.currentTurn}>`);
    }

    // Add to correct team
    if (pickingSession.team1.some(m => m.id === message.author.id)) {
      pickingSession.team1.push(target);
    } else {
      pickingSession.team2.push(target);
    }

    pickingSession.available = pickingSession.available.filter(p => p.id !== target.id);
    pickingSession.picksLeft--;

    // Switch turn
    pickingSession.currentTurn = pickingSession.team1.includes(message.author) 
      ? pickingSession.team2[0].id 
      : pickingSession.team1[0].id;

    // Update embed
    const embed = new EmbedBuilder()
      .setColor(0xFBBF24)
      .setTitle('Nasl 1 System')
      .addFields(
        { name: 'Team 1 (Captain)', value: pickingSession.team1[0].toString(), inline: true },
        { name: 'Team 2 (Captain)', value: pickingSession.team2[0].toString(), inline: true },
        { name: 'Team 1 Players', value: pickingSession.team1.slice(1).map(m => m.toString()).join('\n') || '—', inline: true },
        { name: 'Team 2 Players', value: pickingSession.team2.slice(1).map(m => m.toString()).join('\n') || '—', inline: true },
        { name: 'Available Players', value: pickingSession.available.map(p => p.toString()).join('\n') || 'None', inline: false },
        { name: 'Next Pick', value: `<@${pickingSession.currentTurn}>`, inline: false }
      )
      .setFooter({ text: `Nasl 1 • ${pickingSession.picksLeft} picks left` })
      .setTimestamp();

    await pickingSession.message.edit({ embeds: [embed] });
    await message.delete();

    // Picking finished → move to voice channels
    if (pickingSession.picksLeft === 0) {
      const final = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('Picking Complete!')
        .setDescription('Teams are ready and moved to their voice channels!')
        .addFields(
          { name: 'Game-1', value: pickingSession.team1.map(m => m.toString()).join('\n'), inline: true },
          { name: 'Game-2', value: pickingSession.team2.map(m => m.toString()).join('\n'), inline: true }
        );

      await pickingSession.notifyChannel.send({ embeds: [final] });

      pickingSession.team1.forEach(m => m.voice.setChannel(pickingSession.game1).catch(() => {}));
      pickingSession.team2.forEach(m => m.voice.setChannel(pickingSession.game2).catch(() => {}));

      setTimeout(() => pickingSession = null, 10000);
    }
  }
};
