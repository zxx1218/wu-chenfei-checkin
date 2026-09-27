const express = require('express');
const router = express.Router();
const PushHistory = require('../models/PushHistory');
const loggerHelper = require('../utils/loggerHelper');

// 获取所有历史记录
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await PushHistory.findAll();
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'push_history',
      { query: 'findAll' },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError('获取推送历史失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取最近的历史记录
router.get('/recent', async (req, res) => {
  const startTime = Date.now();
  try {
    const limit = parseInt(req.query.limit) || 50;
    const records = await PushHistory.findRecent(limit);
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'push_history',
      { query: 'findRecent', limit },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError('获取最近推送历史失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个记录
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const record = await PushHistory.findById(req.params.id);
    if (!record) {
      loggerHelper.logBusinessProcess(
        'PushHistory',
        '查询记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'push_history',
      { id: req.params.id },
      { success: true, data: record },
      startTime
    );
    
    res.json({ data: record });
  } catch (error) {
    loggerHelper.logError(`获取推送历史 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新记录
router.post('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const recordData = req.body;
    
    loggerHelper.logBusinessProcess(
      'PushHistory',
      '接收创建请求',
      { 
        target: recordData.target,
        title: recordData.title?.substring(0, 30),
        hasReply: !!recordData.reply_to_id
      }
    );
    
    const record = await PushHistory.create(recordData);
    
    loggerHelper.logDatabaseOperation(
      'CREATE',
      'push_history',
      recordData,
      { success: true, id: record.id, data: record },
      startTime
    );
    
    res.status(201).json({ data: record });
  } catch (error) {
    loggerHelper.logError('创建推送历史失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess(
      'PushHistory',
      '接收删除请求',
      { id: req.params.id }
    );
    
    const success = await PushHistory.delete(req.params.id);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'PushHistory',
        '删除记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'DELETE',
      'push_history',
      { id: req.params.id },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    loggerHelper.logError(`删除推送历史 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 根据日期获取记录
router.get('/date/:date', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await PushHistory.findByDate(req.params.date);
    
    loggerHelper.logDatabaseOperation(
      'FIND',
      'push_history',
      { date: req.params.date },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError(`根据日期 ${req.params.date} 获取推送历史失败`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
