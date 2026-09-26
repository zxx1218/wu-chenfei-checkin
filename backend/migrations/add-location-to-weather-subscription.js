const { promisePool } = require('../config/db');
const logger = require('../config/logger');

async function addLocationToWeatherSubscription() {
  try {
    console.log('开始添加地区字段到weather_push_subscription表...');

    // 检查字段是否已存在
    const [columns] = await promisePool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'weather_push_subscription' 
       AND COLUMN_NAME IN ('location_name', 'latitude', 'longitude')`
    );

    if (columns.length === 3) {
      console.log('地区字段已存在，跳过迁移');
      return;
    }

    // 添加location_name字段
    if (!columns.find(c => c.COLUMN_NAME === 'location_name')) {
      await promisePool.query(
        `ALTER TABLE weather_push_subscription 
         ADD COLUMN location_name VARCHAR(100) NULL COMMENT '地区名称（如：浙江省湖州市德清县）' AFTER message_template`
      );
      console.log('✓ 添加location_name字段成功');
    }

    // 添加latitude字段
    if (!columns.find(c => c.COLUMN_NAME === 'latitude')) {
      await promisePool.query(
        `ALTER TABLE weather_push_subscription 
         ADD COLUMN latitude DECIMAL(10,6) NULL COMMENT '纬度' AFTER location_name`
      );
      console.log('✓ 添加latitude字段成功');
    }

    // 添加longitude字段
    if (!columns.find(c => c.COLUMN_NAME === 'longitude')) {
      await promisePool.query(
        `ALTER TABLE weather_push_subscription 
         ADD COLUMN longitude DECIMAL(10,6) NULL COMMENT '经度' AFTER latitude`
      );
      console.log('✓ 添加longitude字段成功');
    }

    // 为小菲的订阅设置默认地区（浙江省湖州市德清县）
    await promisePool.query(
      `UPDATE weather_push_subscription 
       SET location_name = '浙江省湖州市德清县', latitude = 30.5333, longitude = 120.0833
       WHERE target = '小菲' AND location_name IS NULL`
    );
    console.log('✓ 为小菲设置默认地区：浙江省湖州市德清县');

    // 为zxx的订阅设置默认地区（北京）
    await promisePool.query(
      `UPDATE weather_push_subscription 
       SET location_name = '北京市', latitude = 39.9042, longitude = 116.4074
       WHERE target = 'zxx' AND location_name IS NULL`
    );
    console.log('✓ 为zxx设置默认地区：北京市');

    console.log('地区字段迁移完成！');
  } catch (error) {
    logger.error('添加地区字段失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  addLocationToWeatherSubscription()
    .then(() => {
      console.log('迁移执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移执行失败:', error);
      process.exit(1);
    });
}

module.exports = addLocationToWeatherSubscription;
