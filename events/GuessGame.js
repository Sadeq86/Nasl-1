const { Events, ChannelType, EmbedBuilder } = require('discord.js');

let pickingSession = null;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild;

    // فقط این ۳ خط رو عوض کن
    const MAIN_VOICE_ID     = '1445119433344286841'; // ← چنل Waiting Room
    const NOTIFY_CHANNEL_ID = '144512000111222333'; // ← چنل متنی برای ایمبد
    const CATEGORY_ID       = '1445119862765523165'; // ← کتگوری (یا null)

    const mainVoice = guild.channels.cache.get(MAIN_VOICE_ID);
    const notifyChannel = guild.channels.cache.get(NOTIFY_CHANNEL_ID);
    if (!mainVoice || !notifyChannel) return;

    const members = mainVoice.members.filter(m => !m.user.bot);

    // وقتی دقیقاً ۲ نفر شدن
    if (members.size === 2 && !pickingSession) {
      try {
        // ساخت دو تا چنل
        const [game1, game2] = await Promise.all([
          guild.channels.create({ name: 'Game-1', type: ChannelType.GuildVoice, parent: CATEGORY_ID, userLimit: 10 }),
          guild.channels.create({ name: 'Game-2', type: ChannelType.GuildVoice, parent: CATEGORY_ID, userLimit: 10 })
        ]);

        const players = Array.from(members.values());
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const captain1 = shuffled[0];
        const captain2 = shuffled[1];

        pickingSession = {
          available: players.slice(2),
          team1: [captain1],
          team2: [captain2],
          game1, game2,
          currentTurn: captain1.id,
          picksLeft: 8,
          notifyChannel,
          message: null
        };

        // ایمبد خفن
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('Nasl 1 • Pick System')
          .setDescription(`**Captains Selected**\n**Team 1 Captain**: ${captain1}\n**Team 2 Captain**: ${captain2}\n\nNext pick: ${captain1}\nUse: \`!pick @player\``)
          .setFooter({ text: 'Nasl 1 • Next Gen Bot' })
          .setTimestamp();

        const msg = await notifyChannel.send({ embeds: [embed] });
        pickingSession.message = msg;

        console.log('Picking session started!');

      } catch (err) {
        console.error('Pick system error:', err);
        pickingSession = null;
      }
    }

    // اگه کمتر از ۲ نفر شدن → پاک کن
    if (members.size < 2 && pickingSession) {
      pickingSession.game1?.delete().catch(() => {});
      pickingSession.game2?.delete().catch(() => {});
      pickingSession.message?.delete().catch(() => {});
      pickingSession = null;
    }
  }
};

// برای دسترسی از فایل دیگه
module.exports.pickingSession = () => pickingSession;
module.exports.setPickingSession = (val) => pickingSession = val;
