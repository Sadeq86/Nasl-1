const { ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

function updateStatus(client) {
  try {
    const statusConfigPath = path.join(process.cwd(), 'status.json');
    const statusConfig = JSON.parse(fs.readFileSync(statusConfigPath, 'utf8'));
    const status = statusConfig.status;
    const interval = statusConfig.interval || 15000; // پیش‌فرض ۶۰ ثانیه

    const updatePresence = () => {
      let activityType;
      let activityName = status.state
        .replace('{serverCount}', client.guilds.cache.size)
        .replace('{userCount}', client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));

      // اگر نوع استاتوس STREAMING بود → اسم رو به "Watch" تغییر بده + لینک دعوت سرور
      if (status.type.toUpperCase() === 'STREAMING') {
        activityType = ActivityType.Streaming;
        activityName = activityName || "Nasl 1"; // اسم دلخواه
      } else {
        // برای بقیه نوع‌ها (Playing, Watching, ...)
        switch (status.type.toUpperCase()) {
          case 'PLAYING':   activityType = ActivityType.Playing; break;
          case 'LISTENING': activityType = ActivityType.Listening; break;
          case 'WATCHING':  activityType = ActivityType.Watching; break;
          case 'COMPETING': activityType = ActivityType.Competing; break;
          default:          activityType = ActivityType.Playing;
        }
      }

      const activity = {
        name: activityName,
        type: activityType,
      };

      // فقط وقتی Streaming هست → لینک دعوت سرور خودت رو بذار
      if (status.type.toUpperCase() === 'STREAMING') {
        activity.url = 'https://discord.gg/vJsa3cjE'; // ← اینجا لینک دعوت سرورت رو بذار
      }

      client.user.setPresence({
        activities: [activity],
        status: 'idle' // یا 'idle', 'dnd'
      });
    };

    // اولین بار
    updatePresence();

    // هر چند ثانیه یکبار آپدیت کن (برای آپدیت تعداد سرور و ممبر)
    setInterval(updatePresence, interval);

  } catch (error) {
    console.error('Status Updater Error:', error.message);
  }
}

module.exports = updateStatus;
