const {
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const RankedQueue = require('../models/RankedQueue');

const QUEUE_VOICE_CHANNEL_ID = '1437117580807504033';
const QUEUE_TEXT_CHANNEL_ID = '1456345914443956325';
const CATEGORY_ID = '1437140950500642927';
const REQUIRED_PLAYERS = 8;
const STALE_GAME_TIMEOUT_MS = 30 * 60 * 1000;

async function cleanupStaleGame(guild, game) {
  console.log(`Cleaning up stale game: ${game.gameId}`);
  try {
    if (game.team1VoiceId) {
      const vc1 = guild.channels.cache.get(game.team1VoiceId);
      if (vc1) await vc1.delete().catch(() => {});
    }
    if (game.team2VoiceId) {
      const vc2 = guild.channels.cache.get(game.team2VoiceId);
      if (vc2) await vc2.delete().catch(() => {});
    }
    await RankedQueue.deleteOne({ _id: game._id });
    return true;
  } catch (e) {
    console.error('Failed to cleanup stale game:', e);
    return false;
  }
}

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    if (
      newState.channelId !== QUEUE_VOICE_CHANNEL_ID &&
      oldState.channelId !== QUEUE_VOICE_CHANNEL_ID
    ) {
      return;
    }

    const client = oldState.client;
    const guild = newState.guild || oldState.guild;
    const queueChannel = guild.channels.cache.get(QUEUE_VOICE_CHANNEL_ID);

    if (!queueChannel) return;

    const members = queueChannel.members;

    if (members.size >= REQUIRED_PLAYERS) {
      const textChannel = guild.channels.cache.get(QUEUE_TEXT_CHANNEL_ID);
      if (!textChannel) {
        console.error('Queue text channel not found, cannot start queue');
        return;
      }

      const category = guild.channels.cache.get(CATEGORY_ID);
      if (!category) {
        console.error('Category channel not found, cannot start queue');
        return;
      }

      const existingGame = await RankedQueue.findOne({
        guildId: guild.id,
        status: 'picking',
      });

      if (existingGame) {
        const gameAge = Date.now() - new Date(existingGame.createdAt).getTime();
        if (gameAge > STALE_GAME_TIMEOUT_MS) {
          const cleaned = await cleanupStaleGame(guild, existingGame);
          if (!cleaned) {
            console.error(
              'Cannot start new queue - failed to cleanup stale game'
            );
            return;
          }
        } else {
          return;
        }
      }

      const players = Array.from(members.values())
        .slice(0, REQUIRED_PLAYERS)
        .map((m) => m.id);

      const shuffled = players.sort(() => Math.random() - 0.5);
      const captain1 = shuffled[0];
      const captain2 = shuffled[1];
      const remainingPlayers = shuffled.slice(2);

      const gameId = `game_${Date.now()}`;

      let team1Voice, team2Voice;
      try {
        team1Voice = await guild.channels.create({
          name: '〢🎮│Team-1',
          type: ChannelType.GuildVoice,
          parent: category,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.Connect],
            },
          ],
        });

        team2Voice = await guild.channels.create({
          name: '〢🎮│Team-2',
          type: ChannelType.GuildVoice,
          parent: category,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.Connect],
            },
          ],
        });
      } catch (error) {
        console.error('Failed to create team voice channels:', error);
        if (team1Voice) await team1Voice.delete().catch(() => {});
        return;
      }

      const newGame = new RankedQueue({
        guildId: guild.id,
        gameId: gameId,
        captain1: captain1,
        captain2: captain2,
        team1: [captain1],
        team2: [captain2],
        remainingPlayers: remainingPlayers,
        textChannelId: QUEUE_TEXT_CHANNEL_ID,
        team1VoiceId: team1Voice.id,
        team2VoiceId: team2Voice.id,
        currentPick: 1,
        pickOrder: 'captain1',
        picksRemaining: 1,
      });

      const embed = createPickEmbed(guild, newGame);

      let message;
      try {
        message = await textChannel.send({
          content: `<@${captain1}> <@${captain2}>`,
          embeds: [embed],
        });
      } catch (error) {
        console.error('Failed to send queue message, cleaning up:', error);
        await team1Voice.delete().catch(() => {});
        await team2Voice.delete().catch(() => {});
        return;
      }

      newGame.messageId = message.id;

      try {
        await newGame.save();
      } catch (error) {
        console.error('Failed to save game to database:', error);
        await message.delete().catch(() => {});
        await team1Voice.delete().catch(() => {});
        await team2Voice.delete().catch(() => {});
        return;
      }
    }
  },
};

function createPickEmbed(guild, game) {
  const captain1Member = guild.members.cache.get(game.captain1);
  const captain2Member = guild.members.cache.get(game.captain2);

  const team1List = game.team1
    .map((id) => {
      const member = guild.members.cache.get(id);
      return id === game.captain1
        ? `👑 ${member?.displayName || 'Unknown'} (Captain)`
        : `• ${member?.displayName || 'Unknown'}`;
    })
    .join('\n');

  const team2List = game.team2
    .map((id) => {
      const member = guild.members.cache.get(id);
      return id === game.captain2
        ? `👑 ${member?.displayName || 'Unknown'} (Captain)`
        : `• ${member?.displayName || 'Unknown'}`;
    })
    .join('\n');

  const remainingList =
    game.remainingPlayers
      .map((id) => {
        const member = guild.members.cache.get(id);
        return `• ${member?.displayName || 'Unknown'} (<@${id}>)`;
      })
      .join('\n') || 'No players remaining';

  let pickStatus;
  if (game.remainingPlayers.length === 0) {
    pickStatus = '✅ Teams are complete!';
  } else {
    const currentCaptain =
      game.pickOrder === 'captain1'
        ? captain1Member?.displayName
        : captain2Member?.displayName;
    const currentCaptainId =
      game.pickOrder === 'captain1' ? game.captain1 : game.captain2;
    pickStatus = `🎯 <@${currentCaptainId}>'s turn to pick ${game.picksRemaining} player(s)\nUse \`!pick @player\` to select`;
  }

  const embed = new EmbedBuilder()
    .setTitle('🎮 Ranked Bedwars - Captain Pick')
    .setColor('#FF6B6B')
    .addFields(
      { name: '🔴 Team 1', value: team1List || 'Empty', inline: true },
      { name: '🔵 Team 2', value: team2List || 'Empty', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '📋 Available Players', value: remainingList, inline: false },
      { name: '📍 Current Pick', value: pickStatus, inline: false }
    )
    .setFooter({ text: `Game ID: ${game.gameId}` })
    .setTimestamp();

  return embed;
}

module.exports.createPickEmbed = createPickEmbed;
