const { Events, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const Welcome = require('../../models/Welcome'); // adjust path if needed

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.user.bot) return;

    try {
      const welcomeData = await Welcome.findOne({ serverId: member.guild.id });
      if (!welcomeData?.enabled || !welcomeData.channelId) return;

      const channel = member.guild.channels.cache.get(welcomeData.channelId);
      if (!channel) return;

      // Canvas 1024×512
      const canvas = createCanvas(1024, 512);
      const ctx = canvas.getContext('2d');

      // N1-style dark blue gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
      gradient.addColorStop(0, '#0a1a2f');
      gradient.addColorStop(0.5, '#0f2b4a');
      gradient.addColorStop(1, '#0a1a2f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 512);

      // Light blue wave effect
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#00f5ff';
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.arc(512 + Math.sin(i) * 380, 256 + Math.cos(i) * 200, 180 + i * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Big glowing N1 logo
      ctx.font = 'bold 320px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 70;
      ctx.fillText('N1', 512, 256);
      ctx.shadowBlur = 0;

      // Circular avatar
      const avatar = await loadImage(member.user.displayAvatarURL({ size: 256, format: 'png' }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(512, 170, 110, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, 402, 60, 220, 220);
      ctx.restore();

      // Texts
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(member.user.username, 512, 380);

      ctx.fillStyle = '#00f5ff';
      ctx.font = '48px Arial';
      ctx.fillText('Welcome to Nasl 1', 512, 440);

      ctx.fillStyle = '#bbbbbb';
      ctx.font = '38px Arial';
      ctx.fillText(`Member #${member.guild.memberCount}`, 512, 490);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-n1.png' });

      const message = welcomeData.description
        .replace('{member}', member)
        .replace('{server}', member.guild.name);

      await channel.send({ content: message, files: [attachment] });

    } catch (err) {
      console.error('Welcome System Error:', err);
    }
  }
};
