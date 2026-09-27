const express = require('express');
const router = express.Router();
const DoiRecord = require('../models/DoiRecord');
const { upload, extractVideoUrl } = require('../middlewares/videoUpload');
const loggerHelper = require('../utils/loggerHelper');

// 获取所有DOI记录
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await DoiRecord.findAll();
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'doi_records',
      { query: 'findAll' },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError('获取DOI记录失败', error);
    res.status(500).json({ error: '获取DOI记录失败' });
  }
});

// 根据ID获取单个DOI记录
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const record = await DoiRecord.findById(req.params.id);
    if (!record) {
      loggerHelper.logBusinessProcess(
        'DoiRecord',
        '查询记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: '记录未找到' });
    }
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'doi_records',
      { id: req.params.id },
      { success: true, data: record },
      startTime
    );
    
    res.json({ data: record });
  } catch (error) {
    loggerHelper.logError(`获取DOI记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: '获取DOI记录失败' });
  }
});

// 创建新的DOI记录（支持视频上传）
router.post('/', upload.single('video'), extractVideoUrl, async (req, res) => {
  const startTime = Date.now();
  try {
    // 将上传的视频URL合并到请求体中
    const recordData = {
      ...req.body,
      video_url: req.body.video_url || null
    };
    
    loggerHelper.logBusinessProcess(
      'DoiRecord',
      '接收创建请求（含视频上传）',
      { 
        date: recordData.date,
        hasVideo: !!recordData.video_url,
        rating: recordData.rating
      }
    );
    
    const record = await DoiRecord.create(recordData);
    
    loggerHelper.logDatabaseOperation(
      'CREATE',
      'doi_records',
      recordData,
      { success: true, id: record.id, data: record },
      startTime
    );
    
    res.status(201).json({ data: record });
  } catch (error) {
    loggerHelper.logError('创建DOI记录失败', error, [
      '验证请求参数是否完整（date、time等必填字段）',
      '检查数据库约束是否满足',
      '确认MinIO存储服务是否正常'
    ]);
    res.status(500).json({ error: '创建DOI记录失败' });
  }
});

// 更新DOI记录（支持视频上传）
router.put('/:id', upload.single('video'), extractVideoUrl, async (req, res) => {
  const startTime = Date.now();
  try {
    // 将上传的视频URL合并到请求体中
    const updateData = {
      ...req.body,
      video_url: req.body.video_url || undefined // 如果没有新上传的视频，则不更新此字段
    };
    
    loggerHelper.logBusinessProcess(
      'DoiRecord',
      '接收更新请求',
      { id: req.params.id, fields: Object.keys(updateData) }
    );
    
    const record = await DoiRecord.update(req.params.id, updateData);
    if (!record) {
      loggerHelper.logBusinessProcess(
        'DoiRecord',
        '更新记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: '记录未找到' });
    }
    
    loggerHelper.logDatabaseOperation(
      'UPDATE',
      'doi_records',
      { id: req.params.id, ...updateData },
      { success: true, data: record },
      startTime
    );
    
    res.json({ data: record });
  } catch (error) {
    loggerHelper.logError(`更新DOI记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: '更新DOI记录失败' });
  }
});

// 删除DOI记录
router.delete('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess(
      'DoiRecord',
      '接收删除请求',
      { id: req.params.id }
    );
    
    const success = await DoiRecord.delete(req.params.id);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'DoiRecord',
        '删除记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: '记录未找到' });
    }
    
    loggerHelper.logDatabaseOperation(
      'DELETE',
      'doi_records',
      { id: req.params.id },
      { success: true },
      startTime
    );
    
    res.json({ message: '记录删除成功' });
  } catch (error) {
    loggerHelper.logError(`删除DOI记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: '删除DOI记录失败' });
  }
});

// 根据日期获取DOI记录
router.get('/date/:date', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await DoiRecord.findByDate(req.params.date);
    
    loggerHelper.logDatabaseOperation(
      'FIND',
      'doi_records',
      { date: req.params.date },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError(`根据日期 ${req.params.date} 获取DOI记录失败`, error);
    res.status(500).json({ error: '根据日期获取DOI记录失败' });
  }
});

module.exports = router;
