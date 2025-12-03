// events/client/geminiChat.js  ← فقط این فایل رو بساز و بذار تو events

const { Events, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // نیازی به npm install نداره، discord.js v14 خودش داره

const AI_CHANNEL_ID = '1441136897660551419'; // آیدی چنل چت AI
const GEMINI_KEY = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // کلیدت رو اینجا بذار (لینک درست پایین صفحه)

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.id !== AI_CHANNEL_ID) return;
    if (message.author.bot) return;
    if (message.content.startsWith('!')) return;

    await message.channel.sendTyping();

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: "You are a helpful, funny and friendly Discord AI. Always reply in English only. User message: " + message.content }]
              }
            ],
            safetySettings: [
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
          })
        }
      );

      const data = await res.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No response from Gemini');
      }

      let reply = data.candidates[0].content.parts[0].text.trim();

      if (reply.length > 1900) reply = reply.substring(0, 1897) + '...';

      const embed = new EmbedBuilder()
        .setColor(0x00f5ff)
        .setDescription(reply)
        .setFooter({ text: 'Nasl-1 AI ' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.log('Gemini Error:', err.message);
      await message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xff5555)
          .setDescription('Nasl-1 AI Is Sleeping Right Now')
          .setFooter({ text: 'Nasl-1 System' })
        ]
      });
    }
  }
};
