const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith('!pick ')) return;

    const voiceFile = require('../voice/voiceStateUpdate.js');
    const pickingSession = voiceFile.pickingSession();

    if (!pickingSession) return message.reply('No active picking session!');

    const target = message.mentions.members.first();
    if (!target) return message.reply('Mention a player! `!pick @User`');

    if (!pickingSession.available.some(p => p.id === target.id))
      return message.reply('This player is not available!');

    if (message.author.id !== pickingSession.currentTurn)
      return message.reply(`Not your turn! Current: <@${pickingSession.currentTurn}>`);

    // اضافه کردن به تیم
    if (pickingSession.team1[0].id === message.author.id) {
      pickingSession.team1.push(target);
    } else {
      pickingSession.team2.push(target);
    }

    pickingSession.available = pickingSession.available.filter(p => p.id !== target.id);
    pickingSession.picksLeft--;

    pickingSession.currentTurn = pickingSession.team1[0].id === message.author.id
      ? pickingSession.team2[0].id
      : pickingSession.team1[0].id;

    // آپدیت ایمبد
    const embed = new EmbedBuilder()
      .setColor(0xFBBF24)
      .setTitle('Nasl 1 • Live Picking')
      .addFields(
        { name: 'Team 1 Captain', value: pickingSession.team1[0].toString(), inline: true },
        { name: 'Team 2 Captain', value: pickingSession.team2[0].toString(), inline: true },
        { name: 'Team 1', value: pickingSession.team1.slice(1).map(m => m.toString()).join('\n') || '—', inline: true },
        { name: 'Team 2', value: pickingSession.team2.slice(1).map(m => m.toString()).join('\n') || '—', inline: true },
        { name: 'Available', value: pickingSession.available.map(m => m.toString()).join('\n') || 'None', inline: false },
        { name: 'Next Pick', value: `<@${pickingSession.currentTurn}>`, inline: false }
      )
      .setFooter({ text: `Nasl 1 • ${pickingSession.picksLeft} picks left` })
      .setTimestamp();

    await pickingSession.message.edit({ embeds: [embed] });
    await message.delete().catch(() => {});

    // تموم شد
    if (pickingSession.picksLeft === 0) {
      const final = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Picking Complete!')
        .setDescription('Teams moved to voice channels!')
        .addFields(
          { name: 'Game-1', value: pickingSession.team1.map(m => m.toString()).join('\n'), inline: true },
          { name: 'Game-2', value: pickingSession.team2.map(m => m.toString()).join('\n'), inline: true }
        );

      await pickingSession.notifyChannel.send({ embeds: [final] });

      pickingSession.team1.forEach(m => m.voice.setChannel(pickingSession.game1).catch(() => {}));
      pickingSession.team2.forEach(m => m.voice.setChannel(pickingSession.game2).catch(() => {}));

      setTimeout(() => voiceFile.setPickingSession(null), 10000);
    }
  }
};
