const { Events } = require('discord.js');
const startGiveawayScheduler = require('../../functions/giveawayScheduler');
const serverStatusUpdater = require('../../functions/serverStatusUpdater');
const updateStatus = require('../../functions/statusRotation');
const fs = require('fs');
const path = require('path');

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
  },
};
