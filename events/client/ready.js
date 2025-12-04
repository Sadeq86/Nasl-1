// events/client/ready.js
const { Events } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} is online!`);

    // وضعیت بات (ساده و بدون ارور)
    client.user.setActivity('Nasl 1 | /help', { type: 3 }); // Watching

    // مانگویی (اگه قبلاً وصل شده بود دوباره وصل نکن)
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Connected');
    }
  }
};
