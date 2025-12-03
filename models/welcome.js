const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  description: { type: String, default: 'Welcome {member} to {server}' },
  channelId: { type: String, default: null },
});

module.exports = mongoose.model('Welcome', welcomeSchema);
