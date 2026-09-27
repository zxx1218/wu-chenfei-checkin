const express = require('express');
const router = express.Router();
const UserSetting = require('../models/UserSetting');
const loggerHelper = require('../utils/loggerHelper');

// 获取所有设置
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const settings = await UserSetting.findAll();
    // 转换为键值对格式
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'user_settings',
      { query: 'findAll' },
      { success: true, count: settings.length },
      startTime
    );
    
    res.json({ data: settingsMap });
  } catch (error) {
    loggerHelper.logError('获取用户设置失败', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据key获取单个设置
router.get('/:key', async (req, res) => {
  const startTime = Date.now();
  try {
    const setting = await UserSetting.findByKey(req.params.key);
    if (!setting) {
      loggerHelper.logBusinessProcess(
        'UserSetting',
        '查询设置未找到',
        { key: req.params.key },
        'warn'
      );
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'READ',
      'user_settings',
      { key: req.params.key },
      { success: true, data: setting },
      startTime
    );
    
    res.json({ data: { key: setting.setting_key, value: setting.setting_value } });
  } catch (error) {
    loggerHelper.logError(`获取用户设置 ${req.params.key} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 创建或更新设置
router.put('/:key', async (req, res) => {
  const startTime = Date.now();
  try {
    const { value } = req.body;
    if (value === undefined || value === null) {
      loggerHelper.logBusinessProcess(
        'UserSetting',
        '请求参数验证失败',
        { key: req.params.key, error: 'Value is required' },
        'warn'
      );
      return res.status(400).json({ error: 'Value is required' });
    }
    
    loggerHelper.logBusinessProcess(
      'UserSetting',
      '接收更新请求',
      { key: req.params.key, valueLength: String(value).length }
    );
    
    const setting = await UserSetting.upsert(req.params.key, String(value));
    
    loggerHelper.logDatabaseOperation(
      'UPDATE',
      'user_settings',
      { key: req.params.key, value: String(value) },
      { success: true, data: setting },
      startTime
    );
    
    res.json({ data: setting });
  } catch (error) {
    loggerHelper.logError(`更新用户设置 ${req.params.key} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

// 删除设置
router.delete('/:key', async (req, res) => {
  const startTime = Date.now();
  try {
    loggerHelper.logBusinessProcess(
      'UserSetting',
      '接收删除请求',
      { key: req.params.key }
    );
    
    const success = await UserSetting.deleteByKey(req.params.key);
    if (!success) {
      loggerHelper.logBusinessProcess(
        'UserSetting',
        '删除设置未找到',
        { key: req.params.key },
        'warn'
      );
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    loggerHelper.logDatabaseOperation(
      'DELETE',
      'user_settings',
      { key: req.params.key },
      { success: true },
      startTime
    );
    
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    loggerHelper.logError(`删除用户设置 ${req.params.key} 失败`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
