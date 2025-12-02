const { Events, ChannelType, EmbedBuilder } = require('discord.js');

let pickingSession = null;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild || oldState.guild;

    // فقط این ۳ تا آیدی رو عوض کن
    const WAITING_ROOM_ID = '1445119433344286841';
    const TEXT_CHANNEL_ID = '1445129299014451282';
    const CATEGORY_ID     = '1445119862765523165';

    const waitingRoom = guild.channels.cache.get(WAITING_ROOM_ID);
    const textChannel = guild.channels.cache.get(TEXT_CHANNEL_ID);
    if (!waitingRoom || !textChannel) return;

    const members = waitingRoom.members.filter(m => !m.user.bot);

    // اگه کمتر از ۲ نفر شد → پاک کن همه چیز
    if (pickingSession && members.size < 2) {
      pickingSession.game1?.delete().catch(() => {});
      pickingSession.game2?.delete().catch(() => {});
      pickingSession.message?.delete().catch(() => {});
      pickingSession = null;
      return;
    }

    // وقتی دقیقاً ۲ نفر شدن و جلسه‌ای نیست → شروع پیک
    if (members.size === 2 && !pickingSession) {
      try {
        const [game1, game2] = await Promise.all([
          guild.channels.create({ 
            name: 'Team-1', 
            type: ChannelType.GuildVoice, 
            parent: CATEGORY_ID || null, 
            userLimit: 10 
          }),
          guild.channels.create({ 
            name: 'Team-2', 
            type: ChannelType.GuildVoice, 
            parent: CATEGORY_ID || null, 
            userLimit: 10 
          })
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
          picksLeft: Math.max(0, players.length - 2),
          textChannel,
          message: null
        };

        const embed = new EmbedBuilder()
          .setColor(0x00f5ff)  // درست شد: عدد هگز یا '#00f5ff'
          .setTitle('Nasl 1 • Pick Phase')
          .setDescription(`**Captains:** ${captain1} vs ${captain2}\n\n**Current Turn:** ${captain1}\nUse: \`!pick @player\``)
          .setFooter({ text: 'Nasl 1 • Next Gen Bot' })
          .setTimestamp();

        const msg = await textChannel.send({ 
          embeds: [embed], 
          content: '@here Pick Phase Started!' 
        });

        pickingSession.message = msg;
        console.log('Picking session started successfully!');

      } catch (error) {
        console.error('Pick system failed:', error);
        textChannel.send('Error: Could not start picking system!').catch(() => {});
      }
    }
  }
};

module.exports.getSession = () => pickingSession;
