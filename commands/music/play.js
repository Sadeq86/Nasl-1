// commands/music/play.js — FINAL ENGLISH & FULLY WORKING (lavalink-client v3+)
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from different sources')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name or URL')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName('source')
        .setDescription('The source to search from')
        .addChoices(
          { name: 'YouTube', value: 'ytsearch' },
          { name: 'YouTube Music', value: 'ytmsearch' },
          { name: 'Spotify', value: 'spsearch' },
          { name: 'SoundCloud', value: 'scsearch' },
          { name: 'Deezer', value: 'dzsearch' }
        )
    ),

  async autocomplete(interaction) {
    const query = interaction.options.getFocused();
    const member = interaction.member;

    if (!member.voice.channel) {
      return interaction.respond([{ name: 'Join a voice channel first!', value: 'join_vc' }]);
    }

    if (!query.trim()) {
      return interaction.respond([{ name: 'Start typing to search...', value: 'start_typing' }]);
    }

    const source = interaction.options.getString('source') || 'ytsearch';

    try {
      const player = interaction.client.lavalink.manager.create({
        guildId: interaction.guild.id,
        voiceChannelId: member.voice.channel.id,
        textChannelId: interaction.channel.id,
        selfDeaf: true,
      });

      const results = await player.search({ query, source });

      if (!results?.tracks?.length) {
        return interaction.respond([{ name: 'No results found', value: 'no_results' }]);
      }

      const options = results.tracks.slice(0, 25).map((track) => ({
        name: `${track.info.title} - ${track.info.author}`.slice(0, 100),
        value: track.info.uri,
      }));

      await interaction.respond(options);
    } catch (error) {
      console.error('Autocomplete error:', error.message);
      await interaction.respond([{ name: 'Search error', value: 'error' }]);
    }
  },

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const source = interaction.options.getString('source') || 'ytsearch';
    const member = interaction.member;

    if (!member.voice.channel) {
      return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      // Get or create player using .manager (new lavalink-client)
      let player = interaction.client.lavalink.manager.get(interaction.guild.id);

      if (!player) {
        player = interaction.client.lavalink.manager.create({
          guildId: interaction.guild.id,
          voiceChannelId: member.voice.channel.id,
          textChannelId: interaction.channel.id,
          selfDeaf: true,
        });
        await player.connect();
      }

      const result = await player.search({ query, source });

      if (result.loadType === 'LOAD_FAILED') {
        return interaction.editReply({ content: 'Failed to load track.' });
      }

      if (result.loadType === 'NO_MATCHES') {
        return interaction.editReply({ content: 'No results found.' });
      }

      if (result.loadType === 'PLAYLIST_LOADED') {
        const tracks = result.tracks.map(t => ({ ...t, requester: interaction.user }));
        player.queue.add(tracks);

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Playlist Added to Queue')
          .setDescription(`**${result.playlistInfo.name}**\n${tracks.length} tracks`)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
          .setTimestamp();

        if (!player.playing) await player.play();

        return interaction.editReply({ embeds: [embed] });
      }

      // Single track
      const track = { ...result.tracks[0], requester: interaction.user };
      player.queue.add(track);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Track Added to Queue')
        .setDescription(`[${track.info.title}](${track.info.uri})`)
        .addFields(
          { name: 'Artist', value: track.info.author, inline: true },
          { name: 'Duration', value: formatTime(track.info.duration), inline: true },
          { name: 'Position', value: `#${player.queue.size}`, inline: true }
        )
        .setThumbnail(track.info.artworkUrl || null)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      if (!player.playing) await player.play();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Play command error:', error);
      await interaction.editReply({ content: 'An error occurred while playing the song.' }).catch(() => {});
    }
  },
};
