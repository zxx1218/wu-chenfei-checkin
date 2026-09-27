const express = require('express');
const router = express.Router();
const BumpRecord = require('../models/BumpRecord');
const loggerHelper = require('../utils/loggerHelper');

// 获取所有记录
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await BumpRecord.findAll();
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'bump_records',
      { query: 'findAll' },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError('获取所有碰记录失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个记录
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const record = await BumpRecord.findById(req.params.id);
    if (!record) {
      loggerHelper.logBusinessProcess(
        'BumpRecord',
        '查询记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'bump_records',
      { id: req.params.id },
      { success: true, data: record },
      startTime
    );
    
    res.json({ data: record });
  } catch (error) {
    loggerHelper.logError(`获取碰记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新记录
router.post('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const recordData = req.body;
    loggerHelper.logBusinessProcess(
      'BumpRecord',
      '接收创建请求',
      { 
        date: recordData.date,
        type: recordData.type,
        location: recordData.location
      }
    );
    
    const record = await BumpRecord.create(recordData);
    
    loggerHelper.logDatabaseOperation(
      'CREATE',
      'bump_records',
      recordData,
      { success: true, id: record.id, data: record },
      startTime
    );
    
    res.status(201).json({ data: record });
  } catch (error) {
    loggerHelper.logError('创建碰记录失败', error, [
      '验证请求参数是否完整（date、time等必填字段）',
      '检查数据库约束是否满足'
    ]);
    res.status(500).json({ error: error.message });
  }
});

// 更新记录
router.put('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const updateData = req.body;
    loggerHelper.logBusinessProcess(
      'BumpRecord',
      '接收更新请求',
      { id: req.params.id, fields: Object.keys(updateData) }
    );
    
    const success = await BumpRecord.update(req.params.id, updateData);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'BumpRecord',
        '更新记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'UPDATE',
      'bump_records',
      { id: req.params.id, ...updateData },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    loggerHelper.logError(`更新碰记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess(
      'BumpRecord',
      '接收删除请求',
      { id: req.params.id }
    );
    
    const success = await BumpRecord.delete(req.params.id);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'BumpRecord',
        '删除记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'DELETE',
      'bump_records',
      { id: req.params.id },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    loggerHelper.logError(`删除碰记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 根据日期获取记录
router.get('/date/:date', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await BumpRecord.findByDate(req.params.date);
    
    loggerHelper.logDatabaseOperation(
      'FIND',
      'bump_records',
      { date: req.params.date },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError(`根据日期 ${req.params.date} 获取碰记录失败`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
