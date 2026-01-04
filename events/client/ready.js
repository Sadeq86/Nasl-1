
const { Events, ActivityType } = require('discord.js');
const startGiveawayScheduler = require('../../functions/giveawayScheduler');
const serverStatusUpdater = require('../../functions/serverStatusUpdater');
const updateStatus = require('../../functions/statusRotation');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose'); // اضافه کن

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    // صبر کن تا دیتابیس کامل وصل بشه
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for MongoDB connection before starting schedulers...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', () => {
          console.log('✅ MongoDB connected! Starting schedulers...');
          resolve();
        });
      });
    } else {
      console.log('✅ MongoDB already connected. Starting schedulers...');
    }

    // حالا scheduler ها رو شروع کن
    startGiveawayScheduler(client);
    serverStatusUpdater(client);
    updateStatus(client);

    // 24/7 Voice Join
    const voiceChannelId = '1328645767564492800';
    client.guilds.cache.forEach(guild => {
      const channel = guild.channels.cache.get(voiceChannelId);
      if (channel) {
        try {
          const { joinVoiceChannel } = require('@discordjs/voice');
          joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
          });
          console.log(`Successfully joined 24/7 VC in guild: ${guild.name}`);
        } catch (e) {
          console.error(`Failed to join 24/7 VC in guild ${guild.name}:`, e);
        }
      }
    });

    // Lavalink
    client.lavalink.init({ id: client.user.id });
    client.on('raw', (packet) => client.lavalink.sendRawData(packet));

    // بقیه کد کنسول (همون قبلی)
    const commandFolderPath = path.join(__dirname, '../../commands');
    const categories = fs
      .readdirSync(commandFolderPath)
      .filter((file) =>
        fs.statSync(path.join(commandFolderPath, file)).isDirectory()
      );

    let categoryText = `${global.styles.accentColor('📂 Categories:')}\n`;
    categories.forEach((category) => {
      categoryText += ` ${global.styles.primaryColor('🔸')} ${global.styles.commandColor(category)}\n`;
    });

    const startTime = new Date().toLocaleString();
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const serverCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const divider = global.styles.dividerColor('═══════════════════════════════════════════════════════════════');

    console.log(`\n${divider}`);
    console.log(`${global.styles.infoColor('🤖 Bot User :')} ${global.styles.userColor(client.user.tag)}`);
    console.log(`${global.styles.infoColor('🌍 Servers :')} ${global.styles.accentColor(serverCount)}`);
    console.log(`${global.styles.infoColor('👥 Total Users :')} ${global.styles.successColor(userCount)}`);
    console.log(`${global.styles.infoColor('📡 Status :')} ${global.styles.successColor('Online')}`);
    console.log(`${global.styles.infoColor('⏰ Started At :')} ${global.styles.secondaryColor(startTime)}`);
    console.log(`${global.styles.infoColor('📦 Version :')} ${global.styles.secondaryColor('v1.0.0')}`);
    console.log(`${global.styles.infoColor('🔧 Node.js :')} ${global.styles.highlightColor(process.version)}`);
    console.log(`${global.styles.infoColor('💾 Memory Usage :')} ${global.styles.errorColor(`${memoryUsage} MB`)}\n`);
    console.log(`${divider}`);
    console.log(`${categoryText}`);
    console.log(`${divider}`);
    console.log(`${global.styles.successColor('\n🚀 Bot is ready! 🚀')}`);
    console.log(`${divider}\n`);
  },
};
