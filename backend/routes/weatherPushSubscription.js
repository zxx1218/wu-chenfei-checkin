const express = require('express');
const router = express.Router();
const WeatherPushSubscription = require('../models/WeatherPushSubscription');
const WeatherPushService = require('../services/weatherPushService');

// 获取所有订阅配置
router.get('/', async (req, res) => {
  try {
    const subscriptions = await WeatherPushSubscription.findAll();
    res.json({ data: subscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取启用的订阅配置
router.get('/enabled', async (req, res) => {
  try {
    const subscriptions = await WeatherPushSubscription.findEnabled();
    res.json({ data: subscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取单个订阅
router.get('/:id', async (req, res) => {
  try {
    const subscription = await WeatherPushSubscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ data: subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建新订阅
router.post('/', async (req, res) => {
  try {
    const { target, device_key, push_time, enabled, message_template, push_type } = req.body;
    
    if (!target || !device_key) {
      return res.status(400).json({ error: 'target and device_key are required' });
    }
    
    const subscription = await WeatherPushSubscription.create({
      target,
      device_key,
      push_time: push_time || '07:00',
      enabled: enabled !== undefined ? enabled : 1,
      message_template: message_template || null,
      push_type: push_type || 'weather'
    });
    
    res.status(201).json({ data: subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新订阅
router.put('/:id', async (req, res) => {
  try {
    const { target, device_key, push_time, enabled, message_template, push_type } = req.body;
    
    const success = await WeatherPushSubscription.update(req.params.id, {
      target,
      device_key,
      push_time,
      enabled,
      message_template: message_template || null,
      push_type: push_type || 'weather'
    });
    
    if (!success) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除订阅
router.delete('/:id', async (req, res) => {
  try {
    const success = await WeatherPushSubscription.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 手动触发天气推送（用于测试）
router.post('/trigger', async (req, res) => {
  try {
    const { target } = req.body;
    const result = await WeatherPushService.triggerWeatherPush(target);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
