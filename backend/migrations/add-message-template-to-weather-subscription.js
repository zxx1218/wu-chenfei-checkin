const { promisePool } = require('../config/db');

async function addMessageTemplateToWeatherSubscription() {
  try {
    console.log('Adding message_template column to weather_push_subscription table...');
    
    // 检查列是否已存在
    const [columns] = await promisePool.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'weather_push_subscription' 
       AND COLUMN_NAME = 'message_template'`
    );
    
    if (columns.length === 0) {
      // 添加message_template字段
      const alterTableSQL = `
        ALTER TABLE weather_push_subscription 
        ADD COLUMN message_template TEXT NULL COMMENT '自定义消息模板（支持变量：{target}, {temp}, {text}, {windDir}, {windScale}, {humidity}）' 
        AFTER push_time;
      `;
      
      await promisePool.query(alterTableSQL);
      console.log('message_template column added successfully');
    } else {
      console.log('message_template column already exists');
    }
    
  } catch (error) {
    console.error('Error adding message_template column:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addMessageTemplateToWeatherSubscription();
