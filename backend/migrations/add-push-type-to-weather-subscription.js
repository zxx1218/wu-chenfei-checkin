const { promisePool } = require('../config/db');

async function addPushTypeToWeatherSubscription() {
  try {
    console.log('Adding push_type column to weather_push_subscription table...');
    
    // 检查列是否已存在
    const [columns] = await promisePool.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'weather_push_subscription' 
       AND COLUMN_NAME = 'push_type'`
    );
    
    if (columns.length === 0) {
      // 添加push_type字段
      const alterTableSQL = `
        ALTER TABLE weather_push_subscription 
        ADD COLUMN push_type VARCHAR(50) NOT NULL DEFAULT 'weather' COMMENT '推送类型（weather-天气推送，其他类型可扩展）' 
        AFTER id;
      `;
      
      await promisePool.query(alterTableSQL);
      console.log('push_type column added successfully with default value "weather"');
    } else {
      console.log('push_type column already exists');
    }
    
  } catch (error) {
    console.error('Error adding push_type column:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addPushTypeToWeatherSubscription();
