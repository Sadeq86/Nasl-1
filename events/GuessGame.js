const { Events, ChannelType } = require('discord.js');

let pickingSession = null;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild;

    // CHANGE THESE 3 LINES:
    const MAIN_VOICE_ID     = '1445119433344286841';    // ← Line 9  → Your Waiting Room voice channel ID
    const NOTIFY_CHANNEL_ID = '1445129299014451282';    // ← Line 10 → Text channel for embeds & !pick
    const CATEGORY_ID       = '1445119862765523165';   // ← Line 11 → Category for Game-1 & Game-2 (optional, can be null)

    const mainVoice = guild.channels.cache.get(MAIN_VOICE_ID);
    const notifyChannel = guild.channels.cache.get(NOTIFY_CHANNEL_ID);
    if (!mainVoice || !notifyChannel) return;

    const members = mainVoice.members.filter(m => !m.user.bot);

    if (members.size === 2 && !pickingSession) {
      try {
        const [game1, game2] = await Promise.all([
          guild.channels.create({
            name: 'Game-1',
            type: ChannelType.GuildVoice,
            parent: CATEGORY_ID,
            userLimit: 10,
            bitrate: 96000,
          }),
          guild.channels.create({
            name: 'Game-2',
            type: ChannelType.GuildVoice,
            parent: CATEGORY_ID,
            userLimit: 10,
            bitrate: 96000,
          })
        ]);

        const players = Array.from(members.values());
        const shuffled = players.sort(() => Math.random() - 0.5);
        const captain1 = shuffled[0];
        const captain2 = shuffled[1];

        pickingSession = {
          allPlayers: players,
          available: players.slice(2),
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
          .setColor(0x5865F2)
          .setTitle('Nasl 1 • Pick System')
          .setDescription(`**Captains Selected!**\nCaptain 1: ${captain1}\nCaptain 2: ${captain2}\n\nCurrent turn: <@${captain1.id}>\nUse: \`!pick @user\``)
          .setFooter({ text: 'Nasl 1 • Next Gen Bot' })
          .setTimestamp();

        const msg = await notifyChannel.send({ embeds: [embed] });
        pickingSession.message = msg;

      } catch (err) {
        console.error('Pick system setup failed:', err);
      }
    }

    // Cancel if less than 2 players
    if (members.size < 2 && pickingSession) {
      pickingSession.game1?.delete().catch(() => {});
      pickingSession.game2?.delete().catch(() => {});
      pickingSession.message?.delete().catch(() => {});
      pickingSession = null;
    }
  }
};
