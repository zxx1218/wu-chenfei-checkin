const express = require('express');
const router = express.Router();
const DoiRecord = require('../models/DoiRecord');
const { upload, extractVideoUrl } = require('../middlewares/videoUpload');

// 获取所有DOI记录
router.get('/', async (req, res) => {
  try {
    const records = await DoiRecord.findAll();
    res.json({ data: records });
  } catch (error) {
    console.error('获取DOI记录失败:', error);
    res.status(500).json({ error: '获取DOI记录失败' });
  }
});

// 根据ID获取单个DOI记录
router.get('/:id', async (req, res) => {
  try {
    const record = await DoiRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: '记录未找到' });
    }
    res.json({ data: record });
  } catch (error) {
    console.error('获取DOI记录失败:', error);
    res.status(500).json({ error: '获取DOI记录失败' });
  }
});

// 创建新的DOI记录（支持视频上传）
router.post('/', upload.single('video'), extractVideoUrl, async (req, res) => {
  try {
    // 将上传的视频URL合并到请求体中
    const recordData = {
      ...req.body,
      video_url: req.body.video_url || null
    };
    
    const record = await DoiRecord.create(recordData);
    res.status(201).json({ data: record });
  } catch (error) {
    console.error('创建DOI记录失败:', error);
    res.status(500).json({ error: '创建DOI记录失败' });
  }
});

// 更新DOI记录（支持视频上传）
router.put('/:id', upload.single('video'), extractVideoUrl, async (req, res) => {
  try {
    // 将上传的视频URL合并到请求体中
    const recordData = {
      ...req.body,
      video_url: req.body.video_url || undefined // 如果没有新上传的视频，则不更新此字段
    };
    
    const record = await DoiRecord.update(req.params.id, recordData);
    if (!record) {
      return res.status(404).json({ error: '记录未找到' });
    }
    res.json({ data: record });
  } catch (error) {
    console.error('更新DOI记录失败:', error);
    res.status(500).json({ error: '更新DOI记录失败' });
  }
});

// 删除DOI记录
router.delete('/:id', async (req, res) => {
  try {
    const success = await DoiRecord.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: '记录未找到' });
    }
    res.json({ message: '记录删除成功' });
  } catch (error) {
    console.error('删除DOI记录失败:', error);
    res.status(500).json({ error: '删除DOI记录失败' });
  }
});

// 根据日期获取DOI记录
router.get('/date/:date', async (req, res) => {
  try {
    const records = await DoiRecord.findByDate(req.params.date);
    res.json({ data: records });
  } catch (error) {
    console.error('根据日期获取DOI记录失败:', error);
    res.status(500).json({ error: '根据日期获取DOI记录失败' });
  }
});

module.exports = router;