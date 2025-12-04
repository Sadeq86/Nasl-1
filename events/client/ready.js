// events/client/ready.js
const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Bot online as ${client.user.tag}`);

    const updateActivity = () => {
      const memberCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

      client.user.setPresence({
        activities: [{
          name: `${memberCount.toLocaleString()} In Nasl-1`,
          type: ActivityType.Streaming,
          url: "https://discord.gg/hdETrUsv" // ← لینک دعوت دائمی سرورت رو اینجا بذار
        }],
        status: 'idle'
      });
    };

    // اولین بار
    updateActivity();

    // هر ۳۰ ثانیه آپدیت کن (تعداد ممبر تغییر کنه)
    setInterval(updateActivity, 30_000);
  }
};

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
