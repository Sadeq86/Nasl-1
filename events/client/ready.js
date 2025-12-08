// events/client/ready.js — FINAL 100% ONLINE (بات آنلاین میشه!)
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    // این خط حتماً باید باشه تا تو لاگ ببینی
    console.log(`BOT IS 100% ONLINE as ${client.user.tag} — Nasl-1 is ALIVE!`);

    // استاتوس خفن
    const update = () => {
      const total = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      client.user.setActivity(`${total.toLocaleString()} In Nasl-1`, {
        type: ActivityType.Streaming,
        url: "https://twitch.tv/nasl1"
      });
    };
    update();
    setInterval(update, 60000);

    // Lavalink
    if (client.lavalink) {
      client.lavalink.init({ id: client.user.id });
      console.log('Lavalink connected');
    }
  }
};
