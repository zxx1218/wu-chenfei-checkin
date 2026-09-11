const { promisePool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class PushHistory {
  static async findAll() {
    const [rows] = await promisePool.query(
      'SELECT * FROM push_history ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM push_history WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = uuidv4();
    const { title, body, target, device_key, sound, status = 'success', reply_to_id = null } = data;
    
    const [result] = await promisePool.query(
      `INSERT INTO push_history (id, title, body, target, device_key, sound, status, reply_to_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, body, target, device_key, sound, status, reply_to_id]
    );
    
    return { id, ...data };
  }

  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM push_history WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async findByDate(date) {
    const [rows] = await promisePool.query(
      'SELECT * FROM push_history WHERE DATE(created_at) = DATE(?)',
      [date]
    );
    return rows;
  }

  static async findRecent(limit = 50) {
    const [rows] = await promisePool.query(
      'SELECT * FROM push_history ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows;
  }
}

module.exports = PushHistory;
