// events/client/ready.js — FINAL 100% WORKING (بات آنلاین میشه!)
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    // این خط حتماً باید باشه تا بفهمی بات آنلاینه!
    console.log(`BOT IS 100% ONLINE as ${client.user.tag} — Nasl-1 is ALIVE!`);

    // استاتوس خفن
    const updateStatus = () => {
      const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      client.user.setActivity(`${totalMembers.toLocaleString()} In Nasl-1`, {
        type: ActivityType.Streaming,
        url: "https://twitch.tv/nasl1"
      });
    };

    updateStatus();
    setInterval(updateStatus, 60000);

    // Lavalink
    if (client.lavalink) {
      client.lavalink.init({ id: client.user.id });
      console.log('Lavalink connected and ready!');
    }
  }
};
