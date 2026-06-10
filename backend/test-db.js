require('dotenv').config();
const { promisePool } = require('./config/db');

async function testConnection() {
  try {
    console.log('正在测试数据库连接...');
    
    // 执行一个简单的查询来测试连接
    const [rows] = await promisePool.query('SELECT 1 + 1 AS solution');
    
    console.log('数据库连接成功!');
    console.log('测试查询结果:', rows[0].solution);
    
    // 测试插入一条记录
    const testDate = new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const testTime = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const testResult = await promisePool.query(
      `INSERT INTO bump_records (id, date, time, type) VALUES (?, ?, ?, ?)`,
      [require('uuid').v4(), testDate, testTime, 'safe']
    );
    
    console.log('测试数据插入成功! 影响行数:', testResult[0].affectedRows);
    
    // 清除测试数据
    await promisePool.query(`DELETE FROM bump_records WHERE date = ? AND time = ? AND type = 'safe' LIMIT 1`, [testDate, testTime]);
    
    console.log('测试数据清理完成');
    
  } catch (error) {
    console.error('数据库连接测试失败:', error.message);
  }
}

testConnection();