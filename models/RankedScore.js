const mongoose = require('mongoose');

const rankedScoreSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  points: { type: Number, default: 0 },
});

rankedScoreSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const rankedGameSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  gameNumber: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const RankedScore = mongoose.model('RankedScore', rankedScoreSchema);
const RankedGame = mongoose.model('RankedGame', rankedGameSchema);

module.exports = { RankedScore, RankedGame };
