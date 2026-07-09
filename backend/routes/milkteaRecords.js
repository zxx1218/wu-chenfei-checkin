const express = require('express');
const router = express.Router();
const MilkteaRecord = require('../models/MilkteaRecord');

// 获取所有记录（不包含图片）
router.get('/', async (req, res) => {
  try {
    const records = await MilkteaRecord.findAll();
    res.json({ data: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个记录（包含图片）
router.get('/:id', async (req, res) => {
  try {
    const record = await MilkteaRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ data: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单条记录的图片
router.get('/:id/image', async (req, res) => {
  try {
    const record = await MilkteaRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (!record.image) {
      return res.status(404).json({ error: 'No image found' });
    }
    res.json({ data: { image: record.image } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建新记录
router.post('/', async (req, res) => {
  try {
    console.log('Received milktea record data:', JSON.stringify(req.body, null, 2));
    const record = await MilkteaRecord.create(req.body);
    console.log('Created record successfully:', record);
    res.status(201).json({ data: record });
  } catch (error) {
    console.error('Error creating milktea record:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// 更新记录
router.put('/:id', async (req, res) => {
  try {
    const success = await MilkteaRecord.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  try {
    const success = await MilkteaRecord.delete(req.params.id);
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
    const records = await MilkteaRecord.findByDate(req.params.date);
    res.json({ data: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;