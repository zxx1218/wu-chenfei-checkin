const { promisePool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class WeatherPushSubscription {
  static async findAll() {
    const [rows] = await promisePool.query(
      'SELECT * FROM weather_push_subscription ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM weather_push_subscription WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = uuidv4();
    const { target, device_key, push_time = '07:00', enabled = 1, message_template = null, push_type = 'weather' } = data;
    
    const [result] = await promisePool.query(
      `INSERT INTO weather_push_subscription (id, push_type, target, device_key, push_time, enabled, message_template) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, push_type, target, device_key, push_time, enabled, message_template]
    );
    
    return { id, push_type, target, device_key, push_time, enabled, message_template };
  }

  static async update(id, data) {
    const { target, device_key, push_time, enabled, message_template, push_type } = data;
    
    const [result] = await promisePool.query(
      `UPDATE weather_push_subscription 
       SET target = ?, device_key = ?, push_time = ?, enabled = ?, message_template = ?, push_type = ?
       WHERE id = ?`,
      [target, device_key, push_time, enabled, message_template, push_type || 'weather', id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM weather_push_subscription WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async findByTarget(target) {
    const [rows] = await promisePool.query(
      'SELECT * FROM weather_push_subscription WHERE target = ?',
      [target]
    );
    return rows;
  }

  static async findEnabled() {
    const [rows] = await promisePool.query(
      'SELECT * FROM weather_push_subscription WHERE enabled = 1'
    );
    return rows;
  }

  static async findByType(pushType) {
    const [rows] = await promisePool.query(
      'SELECT * FROM weather_push_subscription WHERE push_type = ? AND enabled = 1',
      [pushType]
    );
    return rows;
  }
}

module.exports = WeatherPushSubscription;
