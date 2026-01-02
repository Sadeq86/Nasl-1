const mongoose = require('mongoose');

const rankedQueueSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  gameId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['picking', 'in_progress', 'completed'], default: 'picking' },
  captain1: { type: String, required: true },
  captain2: { type: String, required: true },
  team1: [{ type: String }],
  team2: [{ type: String }],
  remainingPlayers: [{ type: String }],
  currentPick: { type: Number, default: 1 },
  pickOrder: { type: String, enum: ['captain1', 'captain2'], default: 'captain1' },
  picksRemaining: { type: Number, default: 1 },
  textChannelId: { type: String, required: true },
  team1VoiceId: { type: String },
  team2VoiceId: { type: String },
  messageId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RankedQueue', rankedQueueSchema);
