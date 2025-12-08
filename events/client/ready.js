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
    const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://dexalith85_db_user:nasl1_85@nasl1.bo9txyi.mongodb.net/?appName=Nasl1", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Mongo Connected"))
.catch(err => console.log(err));
