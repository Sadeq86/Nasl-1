// src/events/messageCreate.js — FINAL WORKING VERSION (English + correct parameters)
const { Events, EmbedBuilder } = require('discord.js');

const AI_CHANNEL_ID = '1445129299014451282'; // ← Change if needed

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) { // ← اول message, بعد client (این مهمه!)
    // Only respond in AI channel
    if (message.channel.id !== AI_CHANNEL_ID) return;
    if (message.author.bot) return;
    if (!message.content.trim()) return;

    await message.channel.sendTyping();

    try {
      const response = await fetch('https://api.yesai.ir/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma-7b',
          messages: [{ role: 'user', content: message.content }],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      let reply = data.choices?.[0]?.message?.content?.trim() || 'Thinking...';

      reply = reply.replace(/\\n/g, '\n');

      const embed = new EmbedBuilder()
        .setColor('#00f5ff')
        .setDescription(reply.length > 4096 ? reply.slice(0, 4093) + '...' : reply)
        .setFooter({ text: 'Nasl-1 AI', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('AI Chat Error:', error.message); // ← این لاگ حتماً میاد

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('AI Error')
        .setDescription('AI is having a bad day, try again in 10 seconds!')
        .setFooter({ text: 'Nasl-1 System' })
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] }).catch(() => {});
    }
  }
};
