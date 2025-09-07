const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const ExerciseLog = require('../models/ExerciseLog');
const mongoose = require('mongoose');

// @route   POST /api/exercises/log
// @desc    Log a new exercise session
// @access  Private (Patient and Clinician)
router.post('/log', auth, async (req, res) => {
  const { exerciseType, reps, qualityScore, painDetected } = req.body;
  const userId = req.user.id;

  try {
    const newLog = new ExerciseLog({
      userId,
      exerciseType,
      reps,
      qualityScore,
      painDetected,
    });
    const log = await newLog.save();
    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/exercises/:userId
// @desc    Get exercise history for a specific user
// @access  Private (Patient and Clinician)
router.get('/:userId', auth, async (req, res) => {
  try {
    // A user can only see their own logs, unless they are a clinician
    if (req.user.role === 'patient' && req.user.id !== req.params.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    const logs = await ExerciseLog.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/clinician/patients
// @desc    Get a list of all patients
// @access  Private (Clinician only)
router.get('/clinician/patients', auth, async (req, res) => {
  try {
    if (req.user.role !== 'clinician') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/clinician/patients/:id/report
// @desc    Get aggregated metrics for a patient
// @access  Private (Clinician only)
router.get('/clinician/patients/:id/report', auth, async (req, res) => {
  try {
    if (req.user.role !== 'clinician') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const report = await ExerciseLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: '$exerciseType',
          totalReps: { $sum: '$reps' },
          avgQuality: { $avg: '$qualityScore' },
          totalSessions: { $sum: 1 },
          painDetected: { $sum: { $cond: ['$painDetected', 1, 0] } },
        },
      },
    ]);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found for this user' });
    }

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;