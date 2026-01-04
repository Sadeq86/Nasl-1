const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pick')
    .setDescription('Pick a player for your team')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The player to pick')
        .setRequired(true)),
  async execute(interaction) {
    const client = interaction.client;
    const rq = client.rankedQueue;

    if (!rq.active) {
      return interaction.reply({ content: 'No active ranked game!', ephemeral: true });
    }

    const captain = interaction.user;
    const isCap1 = rq.captains[0].id === captain.id;
    const isCap2 = rq.captains[1].id === captain.id;
    const currentCap = rq.pickingTurn === 'cap1' ? rq.captains[0] : rq.captains[1];

    if (captain.id !== currentCap.id) {
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('❌ You are not the captain whose turn it is!');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const playerIndex = rq.remainingPlayers.findIndex(p => p.id === targetUser.id);

    if (playerIndex === -1) {
      return interaction.reply({ content: 'That user is not in the remaining players list!', ephemeral: true });
    }

    const pickedPlayer = rq.remainingPlayers.splice(playerIndex, 1)[0];
    const teamNum = rq.pickingTurn === 'cap1' ? 1 : 2;
    rq.teams[teamNum].push(pickedPlayer);

    rq.pickStep++;
    
    let nextStepText = "";
    if (rq.pickStep === 2) { rq.pickingTurn = 'cap2'; nextStepText = "Cap2 picks 2"; }
    else if (rq.pickStep === 3) { rq.pickingTurn = 'cap2'; nextStepText = "Cap2 picks 1 more"; }
    else if (rq.pickStep === 4) { rq.pickingTurn = 'cap1'; nextStepText = "Cap1 picks 2"; }
    else if (rq.pickStep === 5) { rq.pickingTurn = 'cap1'; nextStepText = "Cap1 picks 1 more"; }
    else if (rq.pickStep === 6) { rq.pickingTurn = 'cap2'; nextStepText = "Cap2 picks 1"; }
    else if (rq.pickStep === 7) { rq.pickingTurn = 'cap1'; nextStepText = "Cap1 picks 1"; }

    if (rq.remainingPlayers.length === 1) {
       rq.teams[2].push(rq.remainingPlayers.pop());
       rq.active = false;
       
       const team1 = rq.teams[1];
       const team2 = rq.teams[2];

       const finalEmbed = new EmbedBuilder()
         .setColor('Green')
         .setTitle('🎮 | Nasl-1 Private Game Results')
         .setDescription(`
**👥 | Team 1 :**                               **👥 | Team 2 :**
${team1.map((p, i) => `${i === 0 ? '⭐' : '👤'} | ${p}`).join('\n')}         ${team2.map((p, i) => `${i === 0 ? '⭐' : '👤'} | ${p}`).join('\n')}

🎟️ | Nasl-1 System
         `);

       await interaction.reply({ embeds: [finalEmbed] });

       const guild = interaction.guild;
       const v1 = await guild.channels.fetch(rq.team1Voice);
       const v2 = await guild.channels.fetch(rq.team2Voice);

       for (const p of team1) { try { await p.voice.setChannel(v1); } catch(e){} }
       for (const p of team2) { try { await p.voice.setChannel(v2); } catch(e){} }

       await v1.permissionOverwrites.edit(guild.roles.everyone, { [PermissionFlagsBits.Connect]: false });
       await v2.permissionOverwrites.edit(guild.roles.everyone, { [PermissionFlagsBits.Connect]: false });
       return;
    }

    const updateEmbed = new EmbedBuilder()
      .setTitle('🎮 | Nasl-1 Private Game')
      .setColor('Blue')
      .addFields(
        { name: '🎭 | Captain 1', value: `🗣️ | ${rq.captains[0]}`, inline: true },
        { name: '🎭 | Captain 2', value: `🗣️ | ${rq.captains[1]}`, inline: true },
        { name: ' ', value: '--------------------------------------' },
        { name: '✅ | Picked Players', value: `**Team 1:** ${rq.teams[1].join(', ')}\n**Team 2:** ${rq.teams[2].join(', ')}` },
        { name: '📌 | Remaining Players', value: rq.remainingPlayers.map(p => `👤 | ${p}`).join('\n') }
      )
      .setFooter({ text: `Next: ${nextStepText}\n🎟️ | Nasl-1 System` });

    await interaction.reply({ embeds: [updateEmbed] });
  }
};