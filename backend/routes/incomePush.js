const express = require('express');
const router = express.Router();
const IncomePushConfig = require('../models/IncomePushConfig');
const IncomePushService = require('../services/IncomePushService');
const loggerHelper = require('../utils/loggerHelper');

// 获取所有配置
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const configs = await IncomePushConfig.findAll();
    loggerHelper.logDatabaseOperation('READ', 'income_push_config', { query: 'findAll' }, { success: true, count: configs.length }, startTime);
    res.json({ data: configs });
  } catch (error) {
    loggerHelper.logError('获取收入推送配置失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取启用的配置
router.get('/enabled', async (req, res) => {
  try {
    const configs = await IncomePushConfig.findEnabled();
    res.json({ data: configs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取工资明细字段定义
router.get('/salary-fields', (req, res) => {
  res.json({ data: IncomePushService.SALARY_FIELDS });
});

// 预览推送消息
router.post('/preview', (req, res) => {
  try {
    const result = IncomePushService.previewMessage(req.body);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 手动触发推送
router.post('/trigger/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess('IncomePush', '手动触发推送', { configId: req.params.id });
    const result = await IncomePushService.triggerPush(req.params.id);
    res.json(result);
  } catch (error) {
    loggerHelper.logError('手动触发收入推送失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取
router.get('/:id', async (req, res) => {
  try {
    const config = await IncomePushConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ error: 'Not found' });
    res.json({ data: config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建配置
router.post('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const data = req.body;
    loggerHelper.logBusinessProcess('IncomePushConfig', '创建配置', {
      target: data.target,
      itemType: data.item_type,
      itemName: data.item_name,
    });

    const config = await IncomePushConfig.create(data);
    loggerHelper.logDatabaseOperation('CREATE', 'income_push_config', data, { success: true, id: config.id }, startTime);
    res.status(201).json({ data: config });
  } catch (error) {
    loggerHelper.logError('创建收入推送配置失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新配置
router.put('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess('IncomePushConfig', '更新配置', { id: req.params.id });
    const success = await IncomePushConfig.update(req.params.id, req.body);
    if (!success) return res.status(404).json({ error: 'Not found' });
    loggerHelper.logDatabaseOperation('UPDATE', 'income_push_config', { id: req.params.id }, { success: true }, startTime);
    res.json({ message: 'Updated' });
  } catch (error) {
    loggerHelper.logError('更新收入推送配置失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除配置
router.delete('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const success = await IncomePushConfig.delete(req.params.id);
    if (!success) return res.status(404).json({ error: 'Not found' });
    loggerHelper.logDatabaseOperation('DELETE', 'income_push_config', { id: req.params.id }, { success: true }, startTime);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
