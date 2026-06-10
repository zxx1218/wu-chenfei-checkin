require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { promisePool } = require('../config/db');

/**
 * 将CSV内容解析为数组
 * @param {string} csvContent - CSV内容字符串
 * @returns {Array<Array<string>>} 解析后的二维数组，第一行为表头
 */
function parseCSV(csvContent) {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        row.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current);
    result.push(row);
  }
  
  return result;
}

/**
 * 清理datetime字符串格式，移除时区信息
 * @param {string} datetimeStr - 原始datetime字符串
 * @returns {string} 清理后的datetime字符串
 */
function cleanDateTime(datetimeStr) {
  if (!datetimeStr) return null;
  
  // 处理带有时区信息的datetime格式，例如 '2026-06-06 12:48:00.832714+00'
  // 移除 '+00' 部分，保留到毫秒的部分
  let cleaned = datetimeStr.replace(/\+\d+$/, ''); // 移除末尾的时区标识如+00
  
  // 只保留到毫秒的部分，格式如 'YYYY-MM-DD HH:MM:SS.sss'
  const match = cleaned.match(/^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?)/);
  if (match) {
    return match[1];
  }
  
  return datetimeStr; // 如果格式不匹配，返回原值
}

/**
 * 转换字符串布尔值为数据库合适的值
 * @param {string} value - 原始值
 * @returns {number|boolean|null} 转换后的值
 */
function convertBoolean(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
      return 1;
    } else if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
      return 0;
    }
  }
  
  // 如果已经是布尔值或数字，直接返回
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  return value;
}

/**
 * 执行SQL查询并安全处理参数
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 参数数组
 */
async function executeQuery(sql, params = []) {
  try {
    const [result] = await promisePool.query(sql, params);
    return result;
  } catch (error) {
    console.error('执行SQL查询时出错:', error.message);
    console.error('SQL:', sql);
    console.error('参数:', params);
    throw error;
  }
}

/**
 * 清空所有相关表
 */
async function truncateTables() {
  console.log('开始清空表数据...');
  
  // 先禁用外键检查以避免删除时的问题
  await executeQuery('SET FOREIGN_KEY_CHECKS = 0;');
  
  // 清空表数据
  await executeQuery('TRUNCATE TABLE bump_records;');
  console.log('  bump_records表已清空');
  
  await executeQuery('TRUNCATE TABLE doi_records;');
  console.log('  doi_records表已清空');
  
  await executeQuery('TRUNCATE TABLE milktea_records;');
  console.log('  milktea_records表已清空');
  
  // 重新启用外键检查
  await executeQuery('SET FOREIGN_KEY_CHECKS = 1;');
  
  console.log('所有表已清空');
}

async function importBumpRecords() {
  console.log('开始导入bump_records数据...');
  
  // 读取CSV文件
  const csvPath = path.join(__dirname, 'bump_records-export-2026-06-10_09-39-27.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const csvData = parseCSV(csvContent);
  
  const headers = csvData[0]; // ['id', 'created_at', 'date', 'time', 'type', 'location', 'severity']
  
  // 构建INSERT语句
  const insertSql = `
    INSERT INTO bump_records (id, created_at, date, time, type, location, severity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  // 处理每一行数据
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    const [id, created_at, date, time, type, location, severity] = row;
    
    // 清理datetime格式并处理空值
    const params = [
      id || null,
      cleanDateTime(created_at) || null,
      date || null,
      time || null,
      type || null,
      location || null,
      severity || null
    ];
    
    try {
      await executeQuery(insertSql, params);
      console.log(`  已插入bump记录: ${id}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`  跳过重复ID: ${id}`);
      } else {
        console.error(`  插入bump记录失败 (${id}):`, error.message);
      }
    }
  }
  
  console.log('bump_records数据导入完成');
}

async function importDoiRecords() {
  console.log('开始导入doi_records数据...');
  
  // 读取CSV文件
  const csvPath = path.join(__dirname, 'doi_records-export-2026-06-10_09-39-37.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const csvData = parseCSV(csvContent);
  
  const headers = csvData[0]; // 包含所有DOI记录的字段
  
  // 构建INSERT语句（包含所有字段）
  const insertSql = `
    INSERT INTO doi_records (
      id, created_at, date, time, duration_minutes, position, passion_score, notes,
      partner_overall_score, partner_passion_score, partner_duration_feedback, 
      partner_position_feedback, partner_comment, partner_reviewer, partner_reviewed_at,
      scene, female_orgasm, oral_sex, oral_explosion, ejaculation_method
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // 处理每一行数据
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    
    // 映射CSV列到数据库字段，并清理datetime和布尔值
    const params = [
      row[0] || null,                           // id
      cleanDateTime(row[1]) || null,            // created_at
      row[2] || null,                           // date
      row[3] || null,                           // time
      row[4] || null,                           // duration_minutes
      row[5] || null,                           // position
      row[6] || null,                           // passion_score
      row[7] || null,                           // notes
      row[8] || null,                           // partner_overall_score
      row[9] || null,                           // partner_passion_score
      row[10] || null,                          // partner_duration_feedback
      row[11] || null,                          // partner_position_feedback
      row[12] || null,                          // partner_comment
      row[13] || null,                          // partner_reviewer
      cleanDateTime(row[14]) || null,           // partner_reviewed_at
      row[15] || null,                          // scene
      convertBoolean(row[16]),                  // female_orgasm
      convertBoolean(row[17]),                  // oral_sex
      convertBoolean(row[18]),                  // oral_explosion
      row[19] || null                           // ejaculation_method
    ];
    
    try {
      await executeQuery(insertSql, params);
      console.log(`  已插入doi记录: ${row[0]}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`  跳过重复ID: ${row[0]}`);
      } else {
        console.error(`  插入doi记录失败 (${row[0]}):`, error.message);
      }
    }
  }
  
  console.log('doi_records数据导入完成');
}

async function importMilkteaRecords() {
  console.log('开始导入milktea_records数据...');
  
  // 读取CSV文件
  const csvPath = path.join(__dirname, 'milktea_records-export-2026-06-10_09-39-44.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const csvData = parseCSV(csvContent);
  
  const headers = csvData[0]; // ['id', 'created_at', 'date', 'time', 'type', 'brand', 'drink_name']
  
  // 构建INSERT语句
  const insertSql = `
    INSERT INTO milktea_records (id, created_at, date, time, type, brand, drink_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  // 处理每一行数据
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    const [id, created_at, date, time, type, brand, drink_name] = row;
    
    // 清理datetime格式并处理空值
    const params = [
      id || null,
      cleanDateTime(created_at) || null,
      date || null,
      time || null,
      type || null,
      brand || null,
      drink_name || null
    ];
    
    try {
      await executeQuery(insertSql, params);
      console.log(`  已插入milktea记录: ${id}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`  跳过重复ID: ${id}`);
      } else {
        console.error(`  插入milktea记录失败 (${id}):`, error.message);
      }
    }
  }
  
  console.log('milktea_records数据导入完成');
}

async function runMigration() {
  console.log('开始执行数据迁移...');
  
  try {
    // 先清空所有表
    await truncateTables();
    
    // 导入所有数据
    await importBumpRecords();
    await importDoiRecords();
    await importMilkteaRecords();
    
    console.log('所有数据迁移完成！');
  } catch (error) {
    console.error('数据迁移过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果此文件被直接运行，则执行迁移
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('迁移脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  importBumpRecords,
  importDoiRecords,
  importMilkteaRecords,
  runMigration
};