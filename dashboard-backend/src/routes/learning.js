const express = require('express');
const router = express.Router();
const LearningItem = require('../models/LearningItem');

// GET all learning items
router.get('/', async (req, res) => {
  try {
    const items = await LearningItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single learning item
router.get('/:id', async (req, res) => {
  try {
    const item = await LearningItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Learning item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE learning item
router.post('/', async (req, res) => {
  try {
    const item = new LearningItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE learning item
router.put('/:id', async (req, res) => {
  try {
    const item = await LearningItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Learning item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE learning item
router.delete('/:id', async (req, res) => {
  try {
    const item = await LearningItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Learning item not found' });
    res.json({ message: 'Learning item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MARK learning item as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const item = await LearningItem.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date(), updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Learning item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
