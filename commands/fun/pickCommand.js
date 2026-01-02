const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const RankedQueue = require('../models/RankedQueue');
const { createPickEmbed } = require('./rankedQueue');

module.exports = {
  name: 'messageCreate',
  slashCommands: [
    {
      data: new SlashCommandBuilder()
        .setName('req')
        .setDescription('Re-queue the current game (Captains only)'),
      async execute(interaction) {
        if (interaction.guild === null) return;

        const game = await RankedQueue.findOne({
          guildId: interaction.guild.id,
          $or: [{ status: 'picking' }, { status: 'in_progress' }],
        });

        if (!game) {
          return interaction.reply({
            content: '❌ No active game found to re-queue!',
            ephemeral: true,
          });
        }

        const userId = interaction.user.id;
        if (userId !== game.captain1 && userId !== game.captain2) {
          return interaction.reply({
            content: '❌ Only captains can re-queue the game!',
            ephemeral: true,
          });
        }

        try {
          if (game.team1VoiceId) {
            const vc1 = interaction.guild.channels.cache.get(game.team1VoiceId);
            if (vc1) await vc1.delete().catch(() => {});
          }
          if (game.team2VoiceId) {
            const vc2 = interaction.guild.channels.cache.get(game.team2VoiceId);
            if (vc2) await vc2.delete().catch(() => {});
          }
          await RankedQueue.deleteOne({ _id: game._id });
          return interaction.reply(
            '✅ Game cancelled and re-queued! You can now start a new game by joining the queue VC.'
          );
        } catch (e) {
          console.error('Failed to re-queue game:', e);
          return interaction.reply({
            content: '❌ Failed to re-queue the game properly.',
            ephemeral: true,
          });
        }
      },
    },
    {
      data: new SlashCommandBuilder()
        .setName('pick')
        .setDescription('Pick a player for your team')
        .addUserOption((option) =>
          option
            .setName('player')
            .setDescription('The player to pick')
            .setRequired(true)
        ),
      async execute(interaction) {
        if (interaction.guild === null) return;

        const mentionedUser = interaction.options.getUser('player');
        const game = await RankedQueue.findOne({
          guildId: interaction.guild.id,
          status: 'picking',
        });

        if (!game) {
          return interaction.reply({
            content: '❌ No active game found!',
            ephemeral: true,
          });
        }

        const userId = interaction.user.id;
        const currentCaptain =
          game.pickOrder === 'captain1' ? game.captain1 : game.captain2;
        if (userId !== currentCaptain) {
          return interaction.reply({
            content: `❌ It's not your turn to pick! Current picker: <@${currentCaptain}>`,
            ephemeral: true,
          });
        }

        if (!game.remainingPlayers.includes(mentionedUser.id)) {
          return interaction.reply({
            content: '❌ This player is not available to pick!',
            ephemeral: true,
          });
        }

        game.remainingPlayers = game.remainingPlayers.filter(
          (id) => id !== mentionedUser.id
        );

        if (game.pickOrder === 'captain1') {
          game.team1.push(mentionedUser.id);
        } else {
          game.team2.push(mentionedUser.id);
        }

        game.picksRemaining -= 1;

        if (game.picksRemaining <= 0) {
          if (game.currentPick === 1) {
            game.pickOrder = 'captain2';
            game.picksRemaining = 2;
            game.currentPick = 2;
          } else if (game.currentPick === 2) {
            game.pickOrder = 'captain1';
            game.picksRemaining = 1;
            game.currentPick = 3;
          } else if (game.currentPick === 3) {
            game.pickOrder = 'captain2';
            game.picksRemaining = 1;
            game.currentPick = 4;
          } else if (game.currentPick === 4) {
            if (game.remainingPlayers.length > 0) {
              game.team1.push(...game.remainingPlayers);
              game.remainingPlayers = [];
            }
          }
        }

        if (
          game.remainingPlayers.length === 0 &&
          game.team1.length === 4 &&
          game.team2.length === 4
        ) {
          game.status = 'in_progress';
          await game.save();

          const team1Voice = interaction.guild.channels.cache.get(
            game.team1VoiceId
          );
          const team2Voice = interaction.guild.channels.cache.get(
            game.team2VoiceId
          );

          if (team1Voice) {
            await team1Voice.permissionOverwrites.edit(interaction.guild.id, {
              Connect: null,
            });

            for (const playerId of game.team1) {
              const member = interaction.guild.members.cache.get(playerId);
              if (member && member.voice.channel) {
                try {
                  await member.voice.setChannel(team1Voice);
                } catch (e) {
                  console.error(`Failed to move ${playerId} to team 1:`, e);
                }
              }
            }
          }

          if (team2Voice) {
            await team2Voice.permissionOverwrites.edit(interaction.guild.id, {
              Connect: null,
            });

            for (const playerId of game.team2) {
              const member = interaction.guild.members.cache.get(playerId);
              if (member && member.voice.channel) {
                try {
                  await member.voice.setChannel(team2Voice);
                } catch (e) {
                  console.error(`Failed to move ${playerId} to team 2:`, e);
                }
              }
            }
          }

          const embed = createPickEmbed(interaction.guild, game);
          embed.setColor('#00FF00');
          embed.setTitle('🎮 Picked Successfully!');

          await interaction.reply({ embeds: [embed] });

          if (game.messageId) {
            try {
              const textChannel = interaction.guild.channels.cache.get(
                game.textChannelId
              );
              const originalMessage = await textChannel.messages.fetch(
                game.messageId
              );
              await originalMessage.edit({ embeds: [embed] });
            } catch (e) {
              console.error('Failed to update original message:', e);
            }
          }
          return;
        }

        await game.save();
        const embed = createPickEmbed(interaction.guild, game);
        await interaction.reply({ embeds: [embed] });

        if (game.messageId) {
          try {
            const textChannel = interaction.guild.channels.cache.get(
              game.textChannelId
            );
            const originalMessage = await textChannel.messages.fetch(
              game.messageId
            );
            await originalMessage.edit({ embeds: [embed] });
          } catch (e) {
            console.error('Failed to update original message:', e);
          }
        }
      },
    },
  ],

  // Message Create handler
  async execute(message) {
    if (message.author.bot) return;
  },
};
