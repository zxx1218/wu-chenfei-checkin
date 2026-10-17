const { promisePool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class IncomePushConfig {
  static async findAll() {
    const [rows] = await promisePool.query(
      'SELECT * FROM income_push_config ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM income_push_config WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = uuidv4();
    const {
      target, device_key = '', item_name, item_type = 'other',
      push_time = '10:00', push_day = 15, push_frequency = 'daily',
      amount = 0, salary_details = null, push_message = null, enabled = 1
    } = data;

    const [result] = await promisePool.query(
      `INSERT INTO income_push_config 
       (id, target, device_key, item_name, item_type, push_time, push_day, push_frequency, amount, salary_details, push_message, enabled) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, target, device_key, item_name, item_type, push_time, push_day, push_frequency,
       amount, salary_details ? JSON.stringify(salary_details) : null,
       push_message, enabled]
    );

    return { id, ...data };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'target', 'device_key', 'item_name', 'item_type', 'push_time',
      'push_day', 'push_frequency', 'amount', 'salary_details', 'push_message', 'enabled'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (field === 'salary_details') {
          values.push(data[field] ? JSON.stringify(data[field]) : null);
        } else {
          values.push(data[field]);
        }
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await promisePool.query(
      `UPDATE income_push_config SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM income_push_config WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findEnabled() {
    const [rows] = await promisePool.query(
      'SELECT * FROM income_push_config WHERE enabled = 1 ORDER BY push_time'
    );
    return rows;
  }

  static async findByTarget(target) {
    const [rows] = await promisePool.query(
      'SELECT * FROM income_push_config WHERE target = ? ORDER BY created_at DESC',
      [target]
    );
    return rows;
  }
}

module.exports = IncomePushConfig;
