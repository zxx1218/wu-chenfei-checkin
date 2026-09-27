const express = require('express');
const router = express.Router();
const WeatherPushSubscription = require('../models/WeatherPushSubscription');
const WeatherPushService = require('../services/weatherPushService');
const loggerHelper = require('../utils/loggerHelper');

// 获取所有订阅配置
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const subscriptions = await WeatherPushSubscription.findAll();
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'weather_push_subscription',
      { query: 'findAll' },
      { success: true, count: subscriptions.length },
      startTime
    );
    
    res.json({ data: subscriptions });
  } catch (error) {
    loggerHelper.logError('获取天气推送订阅列表失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取启用的订阅配置
router.get('/enabled', async (req, res) => {
  const startTime = Date.now();
  try {
    const subscriptions = await WeatherPushSubscription.findEnabled();
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'weather_push_subscription',
      { query: 'findEnabled' },
      { success: true, count: subscriptions.length },
      startTime
    );
    
    res.json({ data: subscriptions });
  } catch (error) {
    loggerHelper.logError('获取启用的天气推送订阅失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个订阅
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const subscription = await WeatherPushSubscription.findById(req.params.id);
    if (!subscription) {
      loggerHelper.logBusinessProcess(
        'WeatherPushSubscription',
        '查询订阅未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'weather_push_subscription',
      { id: req.params.id },
      { success: true, data: subscription },
      startTime
    );
    
    res.json({ data: subscription });
  } catch (error) {
    loggerHelper.logError(`获取天气推送订阅 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新订阅
router.post('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const { target, device_key, push_time, enabled, message_template, push_type } = req.body;
    
    if (!target || !device_key) {
      loggerHelper.logBusinessProcess(
        'WeatherPushSubscription',
        '请求参数验证失败',
        { error: 'target and device_key are required' },
        'warn'
      );
      return res.status(400).json({ error: 'target and device_key are required' });
    }
    
    loggerHelper.logBusinessProcess(
      'WeatherPushSubscription',
      '接收创建请求',
      { 
        target,
        push_time: push_time || '07:00',
        push_type: push_type || 'weather',
        hasTemplate: !!message_template
      }
    );
    
    const subscription = await WeatherPushSubscription.create({
      target,
      device_key,
      push_time: push_time || '07:00',
      enabled: enabled !== undefined ? enabled : 1,
      message_template: message_template || null,
      push_type: push_type || 'weather'
    });
    
    loggerHelper.logDatabaseOperation(
      'CREATE',
      'weather_push_subscription',
      { target, push_time, push_type },
      { success: true, id: subscription.id, data: subscription },
      startTime
    );
    
    res.status(201).json({ data: subscription });
  } catch (error) {
    loggerHelper.logError('创建天气推送订阅失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新订阅
router.put('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const { target, device_key, push_time, enabled, message_template, push_type } = req.body;
    
    loggerHelper.logBusinessProcess(
      'WeatherPushSubscription',
      '接收更新请求',
      { id: req.params.id, fields: Object.keys(req.body) }
    );
    
    const success = await WeatherPushSubscription.update(req.params.id, {
      target,
      device_key,
      push_time,
      enabled,
      message_template: message_template || null,
      push_type: push_type || 'weather'
    });
    
    if (!success) {
      loggerHelper.logBusinessProcess(
        'WeatherPushSubscription',
        '更新订阅未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'UPDATE',
      'weather_push_subscription',
      { id: req.params.id, ...req.body },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    loggerHelper.logError(`更新天气推送订阅 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 删除订阅
router.delete('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess(
      'WeatherPushSubscription',
      '接收删除请求',
      { id: req.params.id }
    );
    
    const success = await WeatherPushSubscription.delete(req.params.id);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'WeatherPushSubscription',
        '删除订阅未找到',
        { id: req.params.id },
        'warn'
      );
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'DELETE',
      'weather_push_subscription',
      { id: req.params.id },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    loggerHelper.logError(`删除天气推送订阅 ${req.params.id} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 手动触发天气推送（用于测试）
router.post('/trigger', async (req, res) => {
  const startTime = Date.now();
  try {
    const { target } = req.body;
    
    loggerHelper.logBusinessProcess(
      'WeatherPushTrigger',
      '手动触发天气推送',
      { target: target || 'all' }
    );
    
    const result = await WeatherPushService.triggerWeatherPush(target);
    
    loggerHelper.logBusinessProcess(
      'WeatherPushTrigger',
      '推送执行完成',
      { 
        success: result.success,
        results: result.results?.length || 0
      },
      result.success ? 'info' : 'error'
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    loggerHelper.logError('手动触发天气推送失败', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
