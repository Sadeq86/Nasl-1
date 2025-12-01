const { Events, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild;

    
    const MAIN_CHANNEL_ID = '1445119433344286841'; 

    
    const CATEGORY_ID = '1445119862765523165'; 

    const mainChannel = guild.channels.cache.get(MAIN_CHANNEL_ID);
    if (!mainChannel) return;

    
    if (newState.channelId === MAIN_CHANNEL_ID) {
      const members = mainChannel.members.filter(m => !m.user.bot);

      
      if (members.size === 8) {
      
        const existing = guild.channels.cache.find(c =>
          c.name === '〢Team-1' || c.name === '〢Team-2'
        );
        if (existing) return; 

        try {
          
          const players = members.map(m => m);
          for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
          }

          
          const team1 = players.slice(0, 4);
          const team2 = players.slice(4, 8);

          
          const [ch1, ch2] = await Promise.all([
            guild.channels.create({
              name: '〢Team-1',
              type: ChannelType.GuildVoice,
              parent: CATEGORY_ID || mainChannel.parentId,
              userLimit: 4,
              bitrate: 96000,
            }),
            guild.channels.create({
              name: '〢Team-2',
              type: ChannelType.GuildVoice,
              parent: CATEGORY_ID || mainChannel.parentId,
              userLimit: 4,
              bitrate: 96000,
            })
          ]);

          
          await Promise.all([
            ...team1.map(m => m.voice.setChannel(ch1).catch(() => {})),
            ...team2.map(m => m.voice.setChannel(ch2).catch(() => {}))
          ]);

          
          const notifyChannel = guild.channels.cache.find(c => c.name.includes('general') || c.name.includes('chat'));
          if (notifyChannel) {
            notifyChannel.send({
              content: `Teames Created!\nTeam 1: ${team1.map(m => m).join(', ')}\nTeam 2: ${team2.map(m => m).join(', ')}`
            });
          }

          console.log('Random Teams Created: 8 players → Team-1 & Team-2');
        } catch (err) {
          console.error('Team creation error:', err);
        }
      }
    }

    
    if (oldState.channelId === MAIN_CHANNEL_ID && mainChannel.members.filter(m => !m.user.bot).size < 8) {
      const teams = guild.channels.cache.filter(c =>
        c.name === '〢Team-1' || c.name === '〢Team-2'
      );
      teams.forEach(ch => ch.delete().catch(() => {}));
    }
  },
};
