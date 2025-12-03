const { Events, ActivityType } = require('discord.js');
const startGiveawayScheduler = require('../../functions/giveawayScheduler');
const updateStatus = require('../../functions/statusRotation');
const fs = require('fs');
const path = require('path');

// Load status.json
let statuses = [];

if (fs.existsSync(statusFilePath)) {
  try {
    statuses = JSON.parse(fs.readFileSync(statusFilePath, 'utf-8'));
    console.log(`Loaded ${statuses.length} status entries from status.json`);
  } catch (err) {
    console.error('Failed to parse status.json, using fallback:', err.message);
    statuses = [{ name: 'Nasl 1', type: 'Playing' }];
  }
} else {
  console.warn('status.json not found, using default status');
  statuses = [{ name: 'Nasl 1 ', type: 'Playing' }];
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    // Start schedulers
    startGiveawayScheduler(client);
    serverStatusUpdater(client);
    updateStatus(client); 

    // Lavalink initialization
    client.lavalink.init({ id: client.user.id });
    client.on('raw', (packet) => client.lavalink.sendRawData(packet));

    // Load command categories
    const commandFolderPath = path.join(__dirname, '../../commands');
    const categories = fs
      .readdirSync(commandFolderPath)
      .filter((file) => fs.statSync(path.join(commandFolderPath, file)).isDirectory())
      .map((cat) => cat.padEnd(14));

    // Stats
    const startTime = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const guildCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    // Fancy console log
    const divider = '═'.repeat(64);
    console.log(`\n${' '.repeat(22)}Nasl 1\n`);
    console.log(divider);
    console.log(` Bot User       : ${client.user.tag}`.padEnd(60));
    console.log(` Guilds         : ${guildCount.toLocaleString()}`.padEnd(60));
    console.log(` Total Users    : ${userCount.toLocaleString()}`.padEnd(60));
    console.log(` Status         : Online`.padEnd(60));
    console.log(` Started At     : ${startTime} (UTC)`.padEnd(60));
    console.log(` Version        : v2.0.0`.padEnd(60));
    console.log(` Node.js        : ${process.version}`.padEnd(60));
    console.log(` Memory Usage   : ${memoryUsage} MB`.padEnd(60));
    console.log(`\n Loaded Categories:`.padEnd(60));
    categories.forEach((cat) => console.log(`   ${cat.trim()}`));
    console.log(divider);
    console.log(`\n${' '.repeat(14)}Nasl 1 is now fully online and ready!\n`);
    console.log(`${divider}\n`);

    // ———————— Dynamic Status from status.json ————————
    let index = 0;

    const setDynamicStatus = () => {
      try {
        const totalMembers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
        const serverCount = client.guilds.cache.size;

        const status = statuses[index % statuses.length];
        if (!status || !status.name) return; 

        index++;

        let name = status.name
          .replace('{members}', totalMembers.toLocaleString('en-US'))
          .replace('{servers}', serverCount.toLocaleString('en-US'));

        client.user.setActivity(name, {
          type: status.type === 'Streaming' ? ActivityType.Streaming :
                status.type === 'Playing' ? ActivityType.Playing :
                status.type === 'Watching' ? ActivityType.Watching :
                status.type === 'Listening' ? ActivityType.Listening : ActivityType.Playing,
          url: status.url || undefined
        });
      } catch (err) {
        console.error('Status update error:', err);
      }
    };

    setDynamicStatus();
    setInterval(setDynamicStatus, 5000); 

    // Set status immediately
    setDynamicStatus();

    // Update every 25 seconds
    setInterval(setDynamicStatus, 5_000);
  },
};
