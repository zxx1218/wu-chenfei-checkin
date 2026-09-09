const express = require('express');
const router = express.Router();
const PushHistory = require('../models/PushHistory');

// 获取所有历史记录
router.get('/', async (req, res) => {
  try {
    const records = await PushHistory.findAll();
    res.json({ data: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取最近的历史记录
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const records = await PushHistory.findRecent(limit);
    res.json({ data: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个记录
router.get('/:id', async (req, res) => {
  try {
    const record = await PushHistory.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ data: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建新记录
router.post('/', async (req, res) => {
  try {
    const record = await PushHistory.create(req.body);
    res.status(201).json({ data: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  try {
    const success = await PushHistory.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据日期获取记录
router.get('/date/:date', async (req, res) => {
  try {
    const records = await PushHistory.findByDate(req.params.date);
    res.json({ data: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
