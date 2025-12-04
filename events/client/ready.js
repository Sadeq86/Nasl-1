// src/events/client/ready.js
const { Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) { // مهم: async اضافه شد
    console.log(`Bot is online as ${client.user.tag}`);

    // وضعیت خفن Streaming + تعداد ممبر + دکمه Watch
    const updateActivity = () => {
      const memberCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

      client.user.setPresence({
        activities: [{
          name: `${memberCount.toLocaleString()} In Nasl-1`,
          type: ActivityType.Streaming, // 1 = Streaming
          url: "https://discord.gg/hdETrUsv" // لینک دعوت دائمی سرورت
        }],
        status: 'online' // یا 'idle' یا 'dnd' — هر چی دوست داری
      });
    };

    // اولین بار
    updateActivity();
    // هر ۳۰ ثانیه آپدیت کن
    setInterval(updateActivity, 30_000);

    console.log('Activity updated:', `${memberCount.toLocaleString()} In Nasl-1`);
  }, 30000);

    // اتصال به MongoDB (فقط اگه وصل نبود)
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
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
