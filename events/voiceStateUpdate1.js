const { Events, ChannelType, EmbedBuilder } = require('discord.js');

let pickingSession = null;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild || oldState.guild;

    const WAITING_ROOM_ID = '1445119433344286841';
    const TEXT_CHANNEL_ID = '1445129299014451282';
    const CATEGORY_ID     = '1445119862765523165';

    const waitingRoom = guild.channels.cache.get(WAITING_ROOM_ID);
    const textChannel = guild.channels.cache.get(TEXT_CHANNEL_ID);
    if (!waitingRoom || !textChannel) return;

    const members = waitingRoom.members.filter(m => !m.user.bot);

    // اگر جلسه فعال بود و تعداد افتاد زیر ۳ → همه چیز پاک شه
    if (pickingSession && members.size < 3) {
      pickingSession.game1?.delete().catch(() => {});
      pickingSession.game2?.delete().catch(() => {});
      pickingSession.message?.delete().catch(() => {});
      pickingSession = null;
      return;
    }

    // فقط وقتی دقیقاً ۸ نفر شدن → شروع پیک
    if (members.size === 8 && !pickingSession) {
      try {
        const [game1, game2] = await Promise.all([
          guild.channels.create({ name: 'Team-1', type: ChannelType.GuildVoice, parent: CATEGORY_ID || null, userLimit: 10 }),
          guild.channels.create({ name: 'Team-2', type: ChannelType.GuildVoice, parent: CATEGORY_ID || null, userLimit: 10 })
        ]);

        const players = Array.from(members.values());
        const shuffled = players.sort(() => Math.random() - 0.5);
        const captain1 = shuffled[0];
        const captain2 = shuffled[1];

        pickingSession = {
          available: shuffled.slice(2), // ۶ نفر باقی‌مونده
          team1: [captain1],
          team2: [captain2],
          game1, game2,
          currentTurn: captain1.id,
          picksLeft: 6,
          pickOrder: [1, 2, 1, 1, 1, 1], // ۱ نفر، ۲ نفر، ۱ نفر، ۱ نفر، ۱ نفر، ۱ نفر
          currentPickIndex: 0,
          textChannel,
          message: null
        };

        const embed = new EmbedBuilder()
          .setColor(0x00f5ff)
          .setTitle('Pick a player')
          .setDescription(`
**Captains**
${captain1}  vs  ${captain2}

**Current Turn** — ${captain1}
**Pick Phase** — 1 player

Use: \`!pick @player\`
          `.trim())
          .setFooter({ text: 'Nasl-1 System' })
          .setTimestamp();

        const msg = await textChannel.send({ content: '@here پیک شروع شد!', embeds: [embed] });
        pickingSession.message = msg;

      } catch (err) {
        console.error(err);
      }
    }
  }
};

module.exports.getSession = () => pickingSession;
