const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const auth = require('../middleware/auth');

// GET /api/members - Get all members (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { sessionName, sessionDate } = req.query;
    let query = {};

    if (sessionName) {
      query.sessionName = sessionName;
    }

    if (sessionDate) {
      // Parse the date and match by date only (ignore time)
      const date = new Date(sessionDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.sessionDate = {
        $gte: date,
        $lt: nextDay
      };
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/members/filters - Get unique session names and dates for filters
router.get('/filters', async (req, res) => {
  try {
    const sessionNames = await Member.distinct('sessionName');
    const sessionDates = await Member.distinct('sessionDate');
    
    // Format dates and get unique date strings
    const uniqueDates = [...new Set(sessionDates.map(date => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    }))].sort().reverse();

    res.json({
      sessionNames: sessionNames.sort(),
      sessionDates: uniqueDates
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/members/:id - Get single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/members - Add new member (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, constituency, sessionName, sessionDate, speechGiven, timeTaken } = req.body;

    if (!name || !constituency || !sessionName || !sessionDate || !speechGiven || timeTaken === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const member = new Member({
      name,
      constituency,
      sessionName,
      sessionDate: new Date(sessionDate),
      speechGiven,
      timeTaken: Number(timeTaken)
    });

    await member.save();
    res.status(201).json(member);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/members/:id - Update member (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, constituency, sessionName, sessionDate, speechGiven, timeTaken } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (constituency) updateData.constituency = constituency;
    if (sessionName) updateData.sessionName = sessionName;
    if (sessionDate) updateData.sessionDate = new Date(sessionDate);
    if (speechGiven) updateData.speechGiven = speechGiven;
    if (timeTaken !== undefined) updateData.timeTaken = Number(timeTaken);

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/members/:id - Delete member (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

