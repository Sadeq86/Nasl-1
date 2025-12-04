// src/events/client/ready.js
const { Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Bot is online as ${client.user.tag}`);

    // Streaming activity + member count + Watch button
    const updateActivity = () => {
      const memberCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

      client.user.setPresence({
        activities: [{
          name: `${memberCount.toLocaleString()} In Nasl-1`,
          type: ActivityType.Streaming,
          url: "https://discord.gg/hdETrUsv" // لینک دعوت دائمی سرورت
        }],
        status: 'online'
      });
    };

    // Run once
    updateActivity();

    // Update every 30 seconds
    setInterval(updateActivity, 30000);

    // Connect to MongoDB only if not already connected
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
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
