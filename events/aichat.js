// events/client/aiChat.js
const { Events, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const AI_CHANNEL_ID = '1441136897660551419'; // آیدی چنل AI
const GEMINI_KEY = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // کلیدت رو بذار

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.id !== AI_CHANNEL_ID) return;
    if (message.author.bot) return;
    if (message.content.startsWith('!')) return;

    await message.channel.sendTyping();

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message.content }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
        })
      });

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I don't know what to say...";

      const embed = new EmbedBuilder()
        .setColor(0x00f5ff)
        .setDescription(reply)
        .setFooter({ text: 'Nasl-1', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.log('AI Error:', err.message);
      await message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xff5555)
          .setDescription('AI is having a bad day, try again in 10 seconds!')
          .setFooter({ text: 'Nasl-1 System' })
        ]
      });
    }
  }
};
