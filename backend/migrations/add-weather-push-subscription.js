const { promisePool } = require('../config/db');

async function addWeatherPushSubscriptionTable() {
  try {
    console.log('Creating weather_push_subscription table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS weather_push_subscription (
        id CHAR(36) NOT NULL PRIMARY KEY,
        target VARCHAR(50) NOT NULL COMMENT '推送目标（zxx/小菲）',
        device_key VARCHAR(255) NOT NULL COMMENT 'Bark设备key',
        push_time VARCHAR(5) NOT NULL DEFAULT '07:00' COMMENT '推送时间（HH:MM格式）',
        enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用（0-禁用，1-启用）',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_target (target),
        INDEX idx_enabled (enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='天气推送订阅配置表';
    `;
    
    await promisePool.query(createTableSQL);
    console.log('weather_push_subscription table created successfully');
    
    // 检查是否有默认配置，如果没有则插入默认配置
    const [rows] = await promisePool.query('SELECT COUNT(*) as count FROM weather_push_subscription');
    if (rows[0].count === 0) {
      console.log('Inserting default weather push subscription...');
      const { v4: uuidv4 } = require('uuid');
      const id = uuidv4();
      
      await promisePool.query(
        `INSERT INTO weather_push_subscription (id, target, device_key, push_time, enabled) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, '小菲', '7eBD3zF6E66Wqq7cCEjTBA', '07:00', 1]
      );
      console.log('Default subscription inserted for 小菲');
    }
    
  } catch (error) {
    console.error('Error creating weather_push_subscription table:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addWeatherPushSubscriptionTable();
