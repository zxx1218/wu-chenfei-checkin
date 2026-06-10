const { promisePool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class MilkteaRecord {
  static async findAll() {
    const [rows] = await promisePool.query(
      'SELECT * FROM milktea_records ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM milktea_records WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = uuidv4();
    const { date, time, type, brand, drink_name, image, drinker } = data;
    
    const [result] = await promisePool.query(
      `INSERT INTO milktea_records (id, date, time, type, brand, drink_name, image, drinker) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, date, time, type, brand, drink_name, image || null, drinker || null]
    );
    
    return { id, ...data };
  }

  static async update(id, data) {
    const { date, time, type, brand, drink_name, image, drinker } = data;
    
    const [result] = await promisePool.query(
      `UPDATE milktea_records 
       SET date = ?, time = ?, type = ?, brand = ?, drink_name = ?, image = ?, drinker = ?
       WHERE id = ?`,
      [date, time, type, brand, drink_name, image || null, drinker || null, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM milktea_records WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async findByDate(date) {
    const [rows] = await promisePool.query(
      'SELECT * FROM milktea_records WHERE date = ?',
      [date]
    );
    return rows;
  }
}

module.exports = MilkteaRecord;