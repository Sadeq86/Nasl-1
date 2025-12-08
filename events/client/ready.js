// events/client/ready.js — FINAL 100% WORKING & NO ERRORS
const { Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Bot is online as ${client.user.tag}`);

    // استاتوس با تعداد ممبر + استریم + دکمه Watch
    const updateActivity = () => {
      const memberCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      client.user.setPresence({
        activities: [{
          name: `${memberCount.toLocaleString()} In Nasl-1`,
          type: ActivityType.Streaming,
          url: "https://discord.gg/hdETrUsv"
        }],
        status: 'online'
      });
    };
    updateActivity();
    setInterval(updateActivity, 30000);

    // مانگویی فقط اگه وصل نباشه
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://dexalith85_db_user:nasl1_85@nasl1.bo9txyi.mongodb.net/nasl1?retryWrites=true&w=majority", {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        console.log('MongoDB Connected Successfully');
      } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
      }
    } else {
      console.log('MongoDB Already Connected');
    }
  }
};
