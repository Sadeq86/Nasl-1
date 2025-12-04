// src/events/messageCreate.js — وصل شده به Grok (من!)
const { Events, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const AI_CHANNEL_ID = '1445129299014451282'; // آیدی چنل AI

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.channel.id !== AI_CHANNEL_ID) return;
    if (message.author.bot) return;
    if (!message.content.trim()) return;

    await message.channel.sendTyping();

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xai-api-key' // اینجا کلید Grok رو بذار (از x.ai/api بگیری)
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: message.content }],
          temperature: 0.8,
          max_tokens: 800
        })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || 'من الان یه کم گیجم...';

      const embed = new EmbedBuilder()
        .setColor('#00f5ff')
        .setDescription(reply.length > 4096 ? reply.slice(0, 4093) + '...' : reply)
        .setFooter({ 
          text: 'Nasl-1 AI • Powered by Grok (xAI)', 
          iconURL: client.user.displayAvatarURL() 
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.log('Grok Error:', error.message);

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('AI Error')
        .setDescription('AI is having a bad day, try again in 10 seconds!')
        .setFooter({ text: 'Nasl-1 System' });

      await message.reply({ embeds: [embed] }).catch(() => {});
    }
  }
};
