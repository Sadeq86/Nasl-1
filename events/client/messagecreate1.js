const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith('!pick ')) return;

    let session;
    try {
      session = require('../voiceStateUpdate1.js').getSession();
    } catch {
      return;
    }
    if (!session) return;

    const target = message.mentions.members.first();
    if (!target) return message.reply('Mention !');
    if (!session.available.some(p => p.id === target.id)) return message.reply('❌ This Player Isnt Here');
    if (message.author.id !== session.currentTurn) return message.reply(`🔴 This Is Not Your Turn : <@${session.currentTurn}>`);

    if (session.team1[0].id === message.author.id) {
      session.team1.push(target);
    } else {
      session.team2.push(target);
    }

    session.available = session.available.filter(p => p.id !== target.id);
    session.picksLeft--;
    session.currentTurn = session.team1[0].id === message.author.id ? session.team2[0].id : session.team1[0].id;

    const embed = new EmbedBuilder()
      .setColor(0x00f5ff)
      .setTitle('Pick a player')
      .addFields(
        { name: 'Team 1', value: session.team1.map(m => m.toString()).join('\n'), inline: true },
        { name: 'Team 2', value: session.team2.map(m => m.toString()).join('\n'), inline: true },
        { name: 'Remaining', value: session.available.map(m => m.toString()).join('\n') || '—', inline: false },
        { name: 'Next Turn', value: `<@${session.currentTurn}>`, inline: false }
      )
      .setFooter({ text: 'Nasl-1 System' })
      .setTimestamp();

    await session.message.edit({ embeds: [embed] });
    await message.delete().catch(() => {});

    if (session.picksLeft === 0) {
      await session.textChannel.send('@everyone پیک تموم شد!');
      session.team1.forEach(m => m.voice.setChannel(session.game1).catch(() => {}));
      session.team2.forEach(m => m.voice.setChannel(session.game2).catch(() => {}));
    }
  }
};
