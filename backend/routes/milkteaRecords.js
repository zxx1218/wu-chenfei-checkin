const express = require('express');
const router = express.Router();
const MilkteaRecord = require('../models/MilkteaRecord');
const loggerHelper = require('../utils/loggerHelper');

// 获取所有记录（不包含图片）
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await MilkteaRecord.findAll();
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'milktea_records',
      { query: 'findAll' },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError('获取奶茶记录列表失败', error, [
      '检查数据库连接是否正常',
      '确认milktea_records表是否存在',
      '查看数据库日志获取更多详情'
    ]);
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个记录（包含图片）
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const record = await MilkteaRecord.findById(req.params.id);
    if (!record) {
      loggerHelper.logBusinessProcess(
        'MilkteaRecord',
        '查询记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'milktea_records',
      { id: req.params.id },
      { success: true, data: record },
      startTime
    );
    
    res.json({ data: record });
  } catch (error) {
    loggerHelper.logError(`获取奶茶记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单条记录的图片
router.get('/:id/image', async (req, res) => {
  const startTime = Date.now();
  try {
    const record = await MilkteaRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (!record.image) {
      loggerHelper.logBusinessProcess(
        'MilkteaRecord',
        '记录无图片',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'No image found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'milktea_records',
      { id: req.params.id, field: 'image' },
      { success: true, hasImage: true },
      startTime
    );
    
    res.json({ data: { image: record.image } });
  } catch (error) {
    loggerHelper.logError(`获取奶茶记录图片 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新记录
router.post('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const recordData = req.body;
    loggerHelper.logBusinessProcess(
      'MilkteaRecord',
      '接收创建请求',
      { 
        date: recordData.date,
        type: recordData.type,
        drinker: recordData.drinker,
        hasImage: !!recordData.image
      }
    );
    
    const record = await MilkteaRecord.create(recordData);
    
    loggerHelper.logDatabaseOperation(
      'CREATE',
      'milktea_records',
      recordData,
      { success: true, id: record.id, data: record },
      startTime
    );
    
    res.status(201).json({ data: record });
  } catch (error) {
    loggerHelper.logError('创建奶茶记录失败', error, [
      '验证请求参数是否完整（date、time等必填字段）',
      '检查数据库约束是否满足',
      '确认MinIO存储服务是否正常'
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
      'MilkteaRecord',
      '接收更新请求',
      { id: req.params.id, fields: Object.keys(updateData) }
    );
    
    const success = await MilkteaRecord.update(req.params.id, updateData);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'MilkteaRecord',
        '更新记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'UPDATE',
      'milktea_records',
      { id: req.params.id, ...updateData },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    loggerHelper.logError(`更新奶茶记录 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess(
      'MilkteaRecord',
      '接收删除请求',
      { id: req.params.id }
    );
    
    const success = await MilkteaRecord.delete(req.params.id);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'MilkteaRecord',
        '删除记录未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Record not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'DELETE',
      'milktea_records',
      { id: req.params.id },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    loggerHelper.logError(`删除奶茶记录 ${req.params.id} 失败`, error, [
      '确认记录ID是否正确',
      '检查是否有外键约束阻止删除'
    ]);
    res.status(500).json({ error: error.message });
  }
});

// 根据日期获取记录
router.get('/date/:date', async (req, res) => {
  const startTime = Date.now();
  try {
    const records = await MilkteaRecord.findByDate(req.params.date);
    
    loggerHelper.logDatabaseOperation(
      'FIND',
      'milktea_records',
      { date: req.params.date },
      { success: true, count: records.length },
      startTime
    );
    
    res.json({ data: records });
  } catch (error) {
    loggerHelper.logError(`根据日期 ${req.params.date} 获取奶茶记录失败`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
