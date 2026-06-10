const { promisePool } = require('../config/db');

class UserSetting {
  static async findAll() {
    const [rows] = await promisePool.query(
      'SELECT * FROM user_settings ORDER BY updated_at DESC'
    );
    return rows;
  }

  static async findByKey(key) {
    const [rows] = await promisePool.query(
      'SELECT * FROM user_settings WHERE setting_key = ?',
      [key]
    );
    return rows[0];
  }

  static async upsert(key, value) {
    // 检查是否已存在
    const existing = await this.findByKey(key);
    
    if (existing) {
      // 更新现有记录
      const [result] = await promisePool.query(
        'UPDATE user_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?',
        [value, key]
      );
      return { id: existing.id, setting_key: key, setting_value: value, updated_at: new Date() };
    } else {
      // 创建新记录
      const [result] = await promisePool.query(
        'INSERT INTO user_settings (setting_key, setting_value) VALUES (?, ?)',
        [key, value]
      );
      return { id: result.insertId, setting_key: key, setting_value: value, updated_at: new Date() };
    }
  }

  static async deleteByKey(key) {
    const [result] = await promisePool.query(
      'DELETE FROM user_settings WHERE setting_key = ?',
      [key]
    );
    return result.affectedRows > 0;
  }
}

module.exports = UserSetting;
