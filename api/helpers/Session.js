const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true },
  deviceName: { type: String, required: true },
  token: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  loggedInAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);
