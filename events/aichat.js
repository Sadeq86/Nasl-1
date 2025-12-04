// src/events/messageCreate.js  ← اسم فایل هر چی هست، اینو جایگزین کن
const { Events, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const AI_CHANNEL_ID = '1445129299014451282'; // آیدی چنل AI
const GEMINI_KEY = process.env.GEMINI_KEY;

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.channel.id !== AI_CHANNEL_ID) return;
    if (message.author.bot) return;
    if (!message.content.trim()) return;

    await message.channel.sendTyping();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: message.content }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 800 }
          })
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!replyText) throw new Error('Empty response from Gemini');

      const embed = new EmbedBuilder()
        .setColor('#00f5ff')
        .setDescription(replyText.length > 4096 ? replyText.slice(0, 4093) + '...' : replyText)
        .setFooter({ 
          text: 'Nasl-1 AI • Powered by Gemini', 
          iconURL: client.user.displayAvatarURL() 
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.log('AI Error:', error.message);

      // اینجا دیگه از client استفاده نمی‌کنیم تا ارور نده
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
