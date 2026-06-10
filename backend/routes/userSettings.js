const express = require('express');
const router = express.Router();
const UserSetting = require('../models/UserSetting');

// 获取所有设置
router.get('/', async (req, res) => {
  try {
    const settings = await UserSetting.findAll();
    // 转换为键值对格式
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });
    res.json({ data: settingsMap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据key获取单个设置
router.get('/:key', async (req, res) => {
  try {
    const setting = await UserSetting.findByKey(req.params.key);
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ data: { key: setting.setting_key, value: setting.setting_value } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建或更新设置
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value is required' });
    }
    const setting = await UserSetting.upsert(req.params.key, String(value));
    res.json({ data: setting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除设置
router.delete('/:key', async (req, res) => {
  try {
    const success = await UserSetting.deleteByKey(req.params.key);
    if (!success) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
