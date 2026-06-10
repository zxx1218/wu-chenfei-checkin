const { promisePool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 辅助函数：将各种值转换为布尔值
const convertToBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return Boolean(value);
};

// 辅助函数：将布尔值转换为数据库存储格式（0或1）
const booleanToDatabaseValue = (value) => {
  if (value === null || value === undefined) return null;
  return convertToBoolean(value) ? 1 : 0;
};

class DoiRecord {
  static async findAll() {
    const [rows] = await promisePool.query(
      'SELECT * FROM doi_records ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM doi_records WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = uuidv4();
    const {
      date, time, duration_minutes, position, passion_score, notes,
      oral_sex, female_orgasm, oral_explosion, ejaculation_method, scene,
      partner_overall_score, partner_passion_score, partner_duration_feedback,
      partner_position_feedback, partner_comment, partner_reviewer, video_url
    } = data;

    const [result] = await promisePool.query(
      `INSERT INTO doi_records (
        id, date, time, duration_minutes, position, passion_score, notes,
        oral_sex, female_orgasm, oral_explosion, ejaculation_method, scene,
        partner_overall_score, partner_passion_score, partner_duration_feedback,
        partner_position_feedback, partner_comment, partner_reviewer, video_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, date, time, duration_minutes, position, passion_score, notes,
        booleanToDatabaseValue(oral_sex), 
        booleanToDatabaseValue(female_orgasm), 
        booleanToDatabaseValue(oral_explosion), 
        ejaculation_method, scene,
        partner_overall_score, partner_passion_score, partner_duration_feedback,
        partner_position_feedback, partner_comment, partner_reviewer, video_url || null
      ]
    );

    return { id, ...data };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        let value = data[key];
        
        // 对于布尔字段，进行相应的转换
        if (['oral_sex', 'female_orgasm', 'oral_explosion'].includes(key)) {
          value = booleanToDatabaseValue(value);
        }
        
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const query = `UPDATE doi_records SET ${fields.join(', ')} WHERE id = ?`;
    await promisePool.query(query, values);

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM doi_records WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findByDate(date) {
    const [rows] = await promisePool.query(
      'SELECT * FROM doi_records WHERE date = ? ORDER BY time DESC',
      [date]
    );
    return rows;
  }
}

module.exports = DoiRecord;