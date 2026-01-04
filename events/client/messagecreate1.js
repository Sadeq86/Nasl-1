// src/events/messagecreate1.js — FINAL 100% WORKING & CLEAN
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith('!pick ')) return;

    // دریافت سشن از voiceStateUpdate1.js
    const { getSession } = require('../voiceStateUpdate1.js');
    const session = getSession();

    if (!session) return;

    const target = message.mentions.members.first();

    // Error Embed Helper
    const errorEmbed = (title, desc) => new EmbedBuilder()
      .setColor(0xff1a1a)
      .setTitle(title)
      .setDescription(desc)
      .setFooter({ text: 'Nasl-1 System' })
      .setTimestamp();

    if (!target) {
      return message.reply({
        embeds: [errorEmbed('Invalid Pick', 'You must mention a player!\nExample: `!pick @Player`')]
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
    }

    if (!session.available.some(p => p.id === target.id)) {
      return message.reply({
        embeds: [errorEmbed('Player Not Available', `${target} has already been picked or is a captain.`)]
      });
    }

    if (message.author.id !== session.currentTurn) {
      const captain = message.guild.members.cache.get(session.currentTurn);
      return message.reply({
        embeds: [errorEmbed('Not Your Turn', `It's currently **${captain?.displayName || 'Captain'}**'s turn.\nPlease wait.`)]
      });
    }

    const isTeam1 = session.team1[0].id === message.author.id;
    const howMany = session.pickOrder[session.currentPickIndex];
    let pickedPlayers = [];

    // Manual pick
    session[isTeam1 ? 'team1' : 'team2'].push(target);
    session.available = session.available.filter(p => p.id !== target.id);
    session.picksLeft--;
    pickedPlayers.push(target);

    // Auto-pick second player if 2x pick
    if (howMany === 2 && session.available.length > 0) {
      const auto = session.available[0];
      session[isTeam1 ? 'team1' : 'team2'].push(auto);
      session.available = session.available.filter(p => p.id !== auto.id);
      session.picksLeft--;
      pickedPlayers.push(auto);

      await message.channel.send({
        content: `${message.author} **picked 2 players!**\n• Manual: ${target}\n• Auto: ${auto}`
      });
    }

    // Update turn
    session.currentPickIndex++;
    session.currentTurn = isTeam1 ? session.team2[0].id : session.team1[0].id;

    // Live picking embed
    const liveEmbed = new EmbedBuilder()
      .setColor(0x00f5ff)
      .setTitle('Pick a Player')
      .setDescription(`
**Captains**
${session.team1[0]}  vs  ${session.team2[0]}

**Current Turn** → <@${session.currentTurn}>
**Next Pick** → ${session.pickOrder[session.currentPickIndex] || 1} player${session.pickOrder[session.currentPickIndex] > 1 ? 's' : ''}
      `.trim())
      .addFields(
        { name: 'Team 1', value: session.team1.map(m => m.toString()).join('\n') || '—', inline: true },
        { name: 'Team 2', value: session.team2.map(m => m.toString()).join('\n') || '—', inline: true },
        { name: 'Remaining Players', value: session.available.length > 0 ? session.available.map(m => m.toString()).join('\n') : 'No one left!', inline: false },
        { name: 'Next Turn', value: `<@${session.currentTurn}> — ${session.pickOrder[session.currentPickIndex] || 1} pick${session.pickOrder[session.currentPickIndex] > 1 ? 's' : ''}`, inline: false }
      )
      .setFooter({ text: 'Nasl-1 System' })
      .setTimestamp();

    await session.message.edit({ content: null, embeds: [liveEmbed] });
    await message.delete().catch(() => {});

    // Picking finished
    if (session.picksLeft === 0) {
      const finalEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Picking Finished — Teams Are Ready!')
        .setDescription('Both teams are complete and have been moved to their voice channels.')
        .addFields(
          { name: 'Team 1', value: session.team1.map(m => m.toString()).join('\n'), inline: true },
          { name: 'Team 2', value: session.team2.map(m => m.toString()).join('\n'), inline: true }
        )
        .setFooter({ text: 'Nasl-1 System' })
        .setTimestamp();

      await session.textChannel.send({
        content: '@everyone **Picking is complete! Teams have been created and moved.**',
        embeds: [finalEmbed]
      });

      // Move players
      session.team1.forEach(m => m.voice.setChannel(session.game1).catch(() => {}));
      session.team2.forEach(m => m.voice.setChannel(session.game2).catch(() => {}));

      // Clear session after 30 seconds
      setTimeout(() => {
        require('../voiceStateUpdate1.js').clearSession();
      }, 30000);
    }
  }
};
