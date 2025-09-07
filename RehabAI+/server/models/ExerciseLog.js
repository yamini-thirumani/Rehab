const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExerciseLogSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  exerciseType: {
    type: String,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
  qualityScore: {
    type: Number,
    required: true,
  },
  painDetected: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('ExerciseLog', ExerciseLogSchema);