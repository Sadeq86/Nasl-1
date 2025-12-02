const { Events, ChannelType, EmbedBuilder } = require('discord.js');

let pickingSession = null;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild || oldState.guild;

    // ←←← فقط این ۳ خط رو با آیدی‌های خودت عوض کن
    const WAITING_ROOM_ID = '1445119433344286841'; // چنل اصلی که همه میان توش
    const TEXT_CHANNEL_ID = '1445129299014451282';  // چنل متنی برای ایمبد
    const CATEGORY_ID     = '1445119862765523165'; // کتگوری (یا null)

    const waitingRoom = guild.channels.cache.get(WAITING_ROOM_ID);
    const textChannel = guild.channels.cache.get(TEXT_CHANNEL_ID);
    if (!waitingRoom || !textChannel) return;

    // فقط اعضای واقعی (نه بات)
    const members = waitingRoom.members.filter(m => !m.user.bot);

    // اگه قبلاً جلسه بود و حالا کمتر از ۲ نفر شدن → پاک کن
    if (pickingSession && members.size < 2) {
      pickingSession.game1?.delete().catch(() => {});
      pickingSession.game2?.delete().catch(() => {});
      pickingSession.message?.delete().catch(() => {});
      pickingSession = null;
      return;
    }

    // فقط وقتی دقیقاً ۲ نفر شدن و قبلاً جلسه نبود
    if (members.size === 2 && !pickingSession) {
      try {
        // ساخت دو تا چنل جدید
        const [game1, game2] = await Promise.all([
          guild.channels.create({ name: '〢🎮│Team-1', type: ChannelType.GuildVoice, parent: CATEGORY_ID || null, userLimit: 10 }),
          guild.channels.create({ name: '〢🎮│Team-2', type: ChannelType.GuildVoice, parent: CATEGORY_ID || null, userLimit: 10 })
        ]);

        const players = Array.from(members.values());
        const [captain1, captain2] = players.sort(() => Math.random() - 0.5);

        pickingSession = {
          available: players.filter(p => p.id !== captain1.id && p.id !== captain2.id),
          team1: [captain1],
          team2: [captain2],
          game1,
          game2,
          currentTurn: captain1.id,
          picksLeft: Math.max(0, players.length - 2),
          textChannel,
          message: null
        };

        const embed = new EmbedBuilder()
          .setColor(#00f5ff)
          .setTitle('Pick A Player')
          .setDescription(`**Captains Selected**\n${captain1}  vs  ${captain2}\n\nCurrent turn: ${captain1}\nUse: \`!pick @player\``)
          .setFooter({ text: 'Nasl 1 System' })
          .setTimestamp();

        const msg = await textChannel.send({ embeds: [embed], content: '🔎 Pick Please ||@here||' });
        pickingSession.message = msg;

        console.log('Picking session started with 2 players!');

      } catch (error) {
        console.error('Failed to start picking:', error);
        textChannel.send('Error: Could not start picking system!').catch(() => {});
      }
    }
  }
};

module.exports.getSession = () => pickingSession;
