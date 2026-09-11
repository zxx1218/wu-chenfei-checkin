require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { promisePool } = require('../config/db');

async function migrate() {
  console.log('开始为push_history表添加reply_to_id字段...');
  console.log('数据库配置:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });
  
  const addColumnSQL = `
    ALTER TABLE push_history 
    ADD COLUMN IF NOT EXISTS reply_to_id CHAR(36) NULL DEFAULT NULL,
    ADD INDEX idx_reply_to_id (reply_to_id);
  `;
  
  try {
    // MySQL不支持IF NOT EXISTS在ALTER TABLE中，所以先检查列是否存在
    const [columns] = await promisePool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'push_history' 
      AND COLUMN_NAME = 'reply_to_id'
    `);
    
    if (columns.length === 0) {
      await promisePool.query(`
        ALTER TABLE push_history 
        ADD COLUMN reply_to_id CHAR(36) NULL DEFAULT NULL,
        ADD INDEX idx_reply_to_id (reply_to_id)
      `);
      console.log('✅ reply_to_id字段添加成功！');
    } else {
      console.log('ℹ️  reply_to_id字段已存在，跳过添加');
    }
    
    // 验证表结构
    const [rows] = await promisePool.query('DESCRIBE push_history');
    console.log('\n更新后的表结构:');
    console.table(rows.map(r => ({
      字段名: r.Field,
      类型: r.Type,
      空值: r.Null,
      键: r.Key,
      默认值: r.Default
    })));
    
    console.log('\n✅ 迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    throw error;
  } finally {
    await promisePool.end();
  }
}

migrate().then(() => {
  console.log('\n🎉 所有操作完成！');
}).catch(err => {
  console.error('\n💥 迁移出错:', err.message);
  process.exit(1);
});
