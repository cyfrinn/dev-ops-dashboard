const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');

// GET all opportunities
router.get('/', async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .where('expiresAt')
      .gte(new Date())
      .sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single opportunity
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE opportunity
router.post('/', async (req, res) => {
  try {
    const opportunity = new Opportunity(req.body);
    await opportunity.save();
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE opportunity
router.put('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opportunity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE opportunity
router.delete('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BULK create opportunities (for automation)
router.post('/bulk', async (req, res) => {
  try {
    const opportunities = req.body;
    const result = await Opportunity.insertMany(opportunities, { ordered: false });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
