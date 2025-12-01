const { Events, ChannelType } = require('discord.js');

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

     
      if (members.size === 2) {

        
        const existing = guild.channels.cache.find(c =>
          c.name === 'Team-1' || c.name === 'Team-2'
        );
        if (existing) return;

        try {
          const [player1, player2] = members.map(m => m);

          
          const [ch1, ch2] = await Promise.all([
            guild.channels.create({
              name: 'Team-1',
              type: ChannelType.GuildVoice,
              parent: CATEGORY_ID || mainChannel.parentId,
              userLimit: 1,        
              bitrate: 64000,
            }),
            guild.channels.create({
              name: 'Team-2',
              type: ChannelType.GuildVoice,
              parent: CATEGORY_ID || mainChannel.parentId,
              userLimit: 1,        
              bitrate: 64000,
            })
          ]);

          
          await Promise.all([
            player1.voice.setChannel(ch1).catch(() => {}),
            player2.voice.setChannel(ch2).catch(() => {})
          ]);

          
          const notifyChannel = guild.channels.cache.find(c => 
            c.name.includes('general') || c.name.includes('chat')
          );
          if (notifyChannel) {
            notifyChannel.send({
              content: `Team Created\nTeam-1: ${player1}\nTeam-2: ${player2}`
            });
          }

          console.log('1v1 Duel Created: 2 players → Team-1 & Team-2');
        } catch (err) {
          console.error('Duel creation error:', err);
        }
      }
    }

    
    if (oldState.channelId === MAIN_CHANNEL_ID) {
      const currentCount = mainChannel.members.filter(m => !m.user.bot).size;
      if (currentCount < 2) {
        const teams = guild.channels.cache.filter(c =>
          c.name === 'Team-1' || c.name === 'Team-2'
        );
        teams.forEach(ch => ch.delete().catch(() => {}));
      }
    }
  },
};
