// src/events/messageCreate.js
const { Events, EmbedBuilder } = require('discord.js');

const AI_CHANNEL_ID = '1445129299014451282'; // آیدی چنل AI خودت

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.channel.id !== AI_CHANNEL_ID) return;
    if (message.author.bot) return;
    if (!message.content.trim()) return;

    await message.channel.sendTyping();

    try {
      const res = await fetch('https://grok.nasl1.ir/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.content,
          user: message.author.username
        })
      });

      const data = await res.json();

      const reply = data.reply || 'Im Thinking .... Wait';

      await message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#00f5ff')
          .setDescription(reply.length > 4096 ? reply.slice(0, 4093) + '...' : reply)
          .setFooter({ 
            text: 'Nasl-1 AI', 
            iconURL: client.user.displayAvatarURL() 
          })
          .setTimestamp()
        ]
      });

    } catch (error) {
      await message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#ff0000')
          .setDescription('Im Tried Right Now.')
          .setFooter({ text: 'Nasl-1 System' })
        ]
      });
    }
  }
};
