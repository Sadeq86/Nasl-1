// events/client/ready.js — FINAL 100% ONLINE VERSION
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Bot is ONLINE as ${client.user.tag}`);

    // استاتوس با تعداد ممبر + استریم + دکمه Watch
    const updateStatus = () => {
      const total = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      client.user.setPresence({
        activities: [{
          name: `${total.toLocaleString()} In Nasl-1`,
          type: ActivityType.Streaming,
          url: "https://discord.gg/SFg3c43M"
        }],
        status: 'online'
      });
    };

    updateStatus();
    setInterval(updateStatus, 60000);

    // Lavalink init
    if (client.lavalink) {
      client.lavalink.init({ id: client.user.id });
      console.log('Lavalink connected');
    }
  }
};
