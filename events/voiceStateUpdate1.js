// src/events/voiceStateUpdate.js
const { Events, ChannelType } = require('discord.js');

const WAITING_ROOM_ID = '1437117580807504033'; // آیدی وویس چنل انتظار
const TEXT_CHANNEL_ID = '1446884447449256137'; // چنل متنی که ایمبد میاد
const CATEGORY_ID = '1437140950500642927';     // کتگوری که وویس‌ها ساخته میشه

let pickingSession = null;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild;
    const waitingRoom = guild.channels.cache.get(WAITING_ROOM_ID);
    const textChannel = guild.channels.cache.get(TEXT_CHANNEL_ID);
    if (!waitingRoom || !textChannel) return;

    const members = waitingRoom.members.filter(m => !m.user.bot);

    // اگر کمتر از ۳ نفر شد → همه چیز پاک شه
    if (pickingSession && members.size < 3) {
      pickingSession.game1?.delete().catch(() => {});
      pickingSession.game2?.delete().catch(() => {});
      pickingSession.message?.delete().catch(() => {});
      pickingSession = null;
      return;
    }

    // دقیقاً وقتی ۸ نفر شدن → شروع بشه
    if (members.size === 8 && !pickingSession) {
      const [game1, game2] = await Promise.all([
        guild.channels.create({ name: 'Team-1', type: ChannelType.GuildVoice, parent: CATEGORY_ID, userLimit: 5 }),
        guild.channels.create({ name: 'Team-2', type: ChannelType.GuildVoice, parent: CATEGORY_ID, userLimit: 5 })
      ]);

      const players = Array.from(members.values()).sort(() => Math.random() - 0.5);
      const captain1 = players[0];
      const captain2 = players[1];

      pickingSession = {
        available: players.slice(2),
        team1: [captain1],
        team2: [captain2],
        game1, game2,
        currentTurn: captain1.id,
        pickOrder: [1, 2, 1, 1, 1, 1],
        currentPickIndex: 0,
        textChannel,
        message: null
      };

      const embed = new EmbedBuilder()
        .setColor('#00f5ff')
        .setTitle('Pick Phase Started!')
        .setDescription(`**Captains**\n${captain1} vs ${captain2}\n\n**Turn:** ${captain1}\nUse: \`!pick @user\``)
        .setFooter({ text: 'Nasl-1 System' });

      const msg = await textChannel.send({ content: '@here کیو ۸ نفره پر شد!', embeds: [embed] });
      pickingSession.message = msg;
    }
  }
};
