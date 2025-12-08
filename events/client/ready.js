// events/client/ready.js — FINAL 100% WORKING (بات آنلاین میشه!)
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    // این خط حتماً باید باشه!
    console.log(`✅ Bot is ONLINE as ${client.user.tag}`);

    // استاتوس خفن
    const updateStatus = () => {
      const total = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
      client.user.setActivity(`${total.toLocaleString()} In Nasl-1`, {
        type: ActivityType.Streaming,
        url: "https://twitch.tv/nasl1"
      });
    };
    updateStatus();
    setInterval(updateStatus, 60000);

    // Lavalink
    if (client.lavalink) {
      client.lavalink.init({ id: client.user.id });
      console.log('Lavalink connected');
    }
  }
};
