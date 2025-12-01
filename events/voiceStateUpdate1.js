const { Events, ChannelType, EmbedBuilder } = require('discord.js');

let pickingSession = null;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild;

    // ←←← فقط این ۳ خط رو با آیدی‌های خودت عوض کن
    const MAIN_VOICE_ID     = '1445119433344286841'; // چنل Waiting Room
    const NOTIFY_CHANNEL_ID = '144512000111222333';  // چنل متنی برای ایمبد
    const CATEGORY_ID       = '1445119862765523165'; // کتگوری Game-1 و Game-2 (می‌تونی null بذاری)

    const mainVoice = guild.channels.cache.get(MAIN_VOICE_ID);
    const notifyChannel = guild.channels.cache.get(NOTIFY_CHANNEL_ID);
    if (!mainVoice || !notifyChannel) return;

    const members = mainVoice.members.filter(m => !m.user.bot);

    // وقتی دقیقاً ۲ نفر شدن
    if (members.size === 2 && !pickingSession) {
      try {
        const [game1, game2] = await Promise.all([
          guild.channels.create({ name: 'Game-1', type: ChannelType.GuildVoice, parent: CATEGORY_ID || null, userLimit: 10 }),
          guild.channels.create({ name: 'Game-2', type: ChannelType.GuildVoice, parent: CATEGORY_ID || null, userLimit: 10 })
        ]);

        const players = Array.from(members.values());
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const captain1 = shuffled[0];
        const captain2 = shuffled[1];

        pickingSession = {
          available: players.filter(p => p.id !== captain1.id && p.id !== captain2.id),
          team1: [captain1],
          team2: [captain2],
          game1,
          game2,
          currentTurn: captain1.id,
          picksLeft: 8,
          notifyChannel,
          message: null
        };

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('Nasl 1 • Pick System')
          .setDescription(`کاپیتان‌ها: ${captain1} vs ${captain2}\n\nنوبت پیک: ${captain1}\nاز دستور \`!pick @user\` استفاده کن`)
          .setFooter({ text: 'Nasl 1 • Next Gen Bot' })
          .setTimestamp();

        const msg = await notifyChannel.send({ embeds: [embed] });
        pickingSession.message = msg;

      } catch (e) {
        console.error('Picking failed:', e);
      }
    }

    if (members.size < 2 && pickingSession) {
      pickingSession.game1?.delete().catch(() => {});
      pickingSession.game2?.delete().catch(() => {});
      pickingSession.message?.delete().catch(() => {});
      pickingSession = null;
    }
  }
};

module.exports.pickingSession = () => pickingSession;
