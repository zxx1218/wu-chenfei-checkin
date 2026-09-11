require('dotenv').config();
const mysql = require('mysql2');

// 基础连接配置（无数据库名称）
const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 3306
};

// 创建基础连接
const connection = mysql.createConnection(baseConfig);

const dbName = process.env.DB_NAME || 'checkin_db';

console.log(`正在创建数据库 ${dbName}...`);

connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`, (err) => {
  if (err) {
    console.error('创建数据库失败:', err);
    connection.end();
    return;
  }

  console.log(`数据库 ${dbName} 创建成功或已存在`);

  // 切换到新数据库
  connection.changeUser({ database: dbName }, (err) => {
    if (err) {
      console.error('切换数据库失败:', err);
      connection.end();
      return;
    }

    // SQL语句：创建bump_records表
    const createBumpRecordsTable = `
      CREATE TABLE IF NOT EXISTS bump_records (
        id CHAR(36) NOT NULL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(20) NOT NULL,
        type ENUM('bump', 'safe') NOT NULL,
        location VARCHAR(255),
        severity ENUM('超痛', '很痛', '一般痛', '不怎么痛')
      );
    `;

    // SQL语句：创建doi_records表
    const createDoiRecordsTable = `
      CREATE TABLE IF NOT EXISTS doi_records (
        id CHAR(36) NOT NULL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(20) NOT NULL,
        duration_minutes INT DEFAULT 0,
        position VARCHAR(255),
        passion_score INT,
        notes TEXT,
        doi_rating VARCHAR(20) NULL DEFAULT NULL,
        oral_sex BOOLEAN,
        oral_explosion BOOLEAN,
        female_orgasm BOOLEAN,
        ejaculation_method VARCHAR(255),
        scene VARCHAR(255),
        partner_overall_score INT,
        partner_passion_score INT,
        partner_duration_feedback TEXT,
        partner_position_feedback TEXT,
        partner_comment TEXT,
        partner_reviewer VARCHAR(255),
        partner_reviewed_at TIMESTAMP NULL,
        video_url VARCHAR(500) NULL DEFAULT NULL
      );
    `;

    // SQL语句：创建milktea_records表
    const createMilkteaRecordsTable = `
      CREATE TABLE IF NOT EXISTS milktea_records (
        id CHAR(36) NOT NULL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(20) NOT NULL,
        type ENUM('milktea', 'no_milktea') NOT NULL,
        brand VARCHAR(255),
        drink_name VARCHAR(255),
        image LONGTEXT,
        drinker VARCHAR(50) NULL DEFAULT NULL,
        zhebei_rating VARCHAR(20) NULL DEFAULT NULL
      );
    `;

    // SQL语句：创建user_settings表
    const createUserSettingsTable = `
      CREATE TABLE IF NOT EXISTS user_settings (
        id CHAR(36) NOT NULL PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    // SQL语句：创建push_history表
    const createPushHistoryTable = `
      CREATE TABLE IF NOT EXISTS push_history (
        id CHAR(36) NOT NULL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        target VARCHAR(50) NOT NULL,
        device_key VARCHAR(255),
        sound VARCHAR(100),
        status ENUM('success', 'failed') DEFAULT 'success',
        reply_to_id CHAR(36) NULL DEFAULT NULL,
        INDEX idx_reply_to_id (reply_to_id)
      );
    `;

    // 执行SQL语句创建表
    connection.query(createBumpRecordsTable, (err) => {
      if (err) {
        console.error('创建bump_records表失败:', err);
        connection.end();
        return;
      }

      console.log('bump_records表创建成功或已存在');

      connection.query(createDoiRecordsTable, (err) => {
        if (err) {
          console.error('创建doi_records表失败:', err);
          connection.end();
          return;
        }

        console.log('doi_records表创建成功或已存在');

        connection.query(createMilkteaRecordsTable, (err) => {
          if (err) {
            console.error('创建milktea_records表失败:', err);
            connection.end();
            return;
          }

          console.log('milktea_records表创建成功或已存在');

          connection.query(createUserSettingsTable, (err) => {
            if (err) {
              console.error('创建user_settings表失败:', err);
              connection.end();
              return;
            }

            console.log('user_settings表创建成功或已存在');

            connection.query(createPushHistoryTable, (err) => {
              if (err) {
                console.error('创建push_history表失败:', err);
                connection.end();
                return;
              }

              console.log('push_history表创建成功或已存在');
              
              console.log('\n数据库初始化完成！');
              console.log('数据库名:', dbName);
              console.log('已创建表: bump_records, doi_records, milktea_records, user_settings, push_history');
              
              connection.end();
            });
          });
        });
      });
    });
  });
});