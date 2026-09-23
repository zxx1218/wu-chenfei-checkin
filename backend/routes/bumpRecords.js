const express = require('express');
const router = express.Router();
const BumpRecord = require('../models/BumpRecord');
const logger = require('../config/logger');

// 获取所有记录
router.get('/', async (req, res) => {
  try {
    const records = await BumpRecord.findAll();
    res.json({ data: records });
  } catch (error) {
    logger.error('获取所有碰记录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个记录
router.get('/:id', async (req, res) => {
  try {
    const record = await BumpRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ data: record });
  } catch (error) {
    logger.error(`获取碰记录 ${req.params.id} 失败:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新记录
router.post('/', async (req, res) => {
  try {
    const record = await BumpRecord.create(req.body);
    logger.info(`创建新的碰记录: ${record.id}`);
    res.status(201).json({ data: record });
  } catch (error) {
    logger.error('创建碰记录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新记录
router.put('/:id', async (req, res) => {
  try {
    const success = await BumpRecord.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Record not found' });
    }
    logger.info(`更新碰记录: ${req.params.id}`);
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    logger.error(`更新碰记录 ${req.params.id} 失败:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  try {
    const success = await BumpRecord.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Record not found' });
    }
    logger.info(`删除碰记录: ${req.params.id}`);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    logger.error(`删除碰记录 ${req.params.id} 失败:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 根据日期获取记录
router.get('/date/:date', async (req, res) => {
  try {
    const records = await BumpRecord.findByDate(req.params.date);
    res.json({ data: records });
  } catch (error) {
    logger.error(`根据日期 ${req.params.date} 获取碰记录失败:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
