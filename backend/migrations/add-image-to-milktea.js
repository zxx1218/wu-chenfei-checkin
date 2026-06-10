require('dotenv').config();
const mysql = require('mysql2');

// 基础连接配置（无数据库名称）
const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 3306
};

const dbName = process.env.DB_NAME || 'checkin_db';

console.log(`正在连接到数据库 ${dbName}...`);

// 创建带数据库名的连接
const connection = mysql.createConnection({
  ...baseConfig,
  database: dbName
});

connection.connect((err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    return;
  }

  console.log('成功连接到数据库');

  // 检查 image 字段是否已存在
  connection.query(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [dbName, 'milktea_records', 'image'],
    (err, results) => {
      if (err) {
        console.error('查询字段失败:', err);
        connection.end();
        return;
      }

      if (results.length > 0) {
        console.log('image 字段已存在，无需迁移');
        connection.end();
        return;
      }

      // 添加 image 字段
      const alterTableSQL = `
        ALTER TABLE milktea_records 
        ADD COLUMN image LONGTEXT NULL COMMENT '奶茶图片(base64格式)'
      `;

      connection.query(alterTableSQL, (err) => {
        if (err) {
          console.error('添加 image 字段失败:', err);
          connection.end();
          return;
        }

        console.log('✓ 成功添加 image 字段到 milktea_records 表');
        console.log('迁移完成！');
        connection.end();
      });
    }
  );
});
