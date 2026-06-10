const { promisePool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class BumpRecord {
  static async findAll() {
    const [rows] = await promisePool.query(
      'SELECT * FROM bump_records ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM bump_records WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = uuidv4();
    const { date, time, type, location, severity } = data;
    
    const [result] = await promisePool.query(
      `INSERT INTO bump_records (id, date, time, type, location, severity) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, date, time, type, location, severity]
    );
    
    return { id, ...data };
  }

  static async update(id, data) {
    const { date, time, type, location, severity } = data;
    
    const [result] = await promisePool.query(
      `UPDATE bump_records 
       SET date = ?, time = ?, type = ?, location = ?, severity = ?
       WHERE id = ?`,
      [date, time, type, location, severity, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM bump_records WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async findByDate(date) {
    const [rows] = await promisePool.query(
      'SELECT * FROM bump_records WHERE date = ?',
      [date]
    );
    return rows;
  }
}

module.exports = BumpRecord;