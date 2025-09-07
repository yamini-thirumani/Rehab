const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeName: {
    type: String,
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Achievement', AchievementSchema);