const { promisePool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class MilkteaRecord {
  static async findAll() {
    // 优化：列表查询时使用CASE判断是否有图片，避免传输大量base64数据
    const [rows] = await promisePool.query(
      'SELECT id, date, time, type, brand, drink_name, drinker, zhebei_rating, created_at, CASE WHEN image IS NOT NULL AND image != "" THEN 1 ELSE 0 END as has_image FROM milktea_records ORDER BY created_at DESC'
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
    const { date, time, type, brand, drink_name, image, drinker, zhebei_rating } = data;
    
    // 如果是补卡奶茶（type === 'milktea'），且指定了drinker，则删除该人当天的"今日很乖"记录
    if (type === 'milktea' && drinker && date) {
      await this.deleteNoMilkteaRecordForPerson(date, drinker);
    }
    
    const [result] = await promisePool.query(
      `INSERT INTO milktea_records (id, date, time, type, brand, drink_name, image, drinker, zhebei_rating) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, date, time, type, brand, drink_name, image || null, drinker || null, zhebei_rating || null]
    );
    
    return { id, ...data };
  }

  static async update(id, data) {
    const { date, time, type, brand, drink_name, image, drinker, zhebei_rating } = data;
    
    // 如果更新为奶茶类型且指定了drinker，则删除该人当天的"今日很乖"记录
    if (type === 'milktea' && drinker && date) {
      await this.deleteNoMilkteaRecordForPerson(date, drinker);
    }
    
    const [result] = await promisePool.query(
      `UPDATE milktea_records 
       SET date = ?, time = ?, type = ?, brand = ?, drink_name = ?, image = ?, drinker = ?, zhebei_rating = ?
       WHERE id = ?`,
      [date, time, type, brand, drink_name, image || null, drinker || null, zhebei_rating || null, id]
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

  // 删除指定日期和饮用者的"今日很乖"记录
  static async deleteNoMilkteaRecordForPerson(date, drinker) {
    try {
      console.log(`Deleting no_milktea record for ${drinker} on ${date}`);
      
      const [result] = await promisePool.query(
        `DELETE FROM milktea_records 
         WHERE date = ? AND type = 'no_milktea' AND drinker = ?`,
        [date, drinker]
      );
      
      if (result.affectedRows > 0) {
        console.log(`Deleted ${result.affectedRows} no_milktea record(s) for ${drinker} on ${date}`);
      } else {
        console.log(`No no_milktea record found for ${drinker} on ${date}`);
      }
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting no_milktea record:', error);
      throw error;
    }
  }
}

module.exports = MilkteaRecord;