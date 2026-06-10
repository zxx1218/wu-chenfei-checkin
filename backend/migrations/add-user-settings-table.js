const { promisePool } = require('../config/db');

async function migrate() {
  console.log('开始创建user_settings表...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_settings (
      id CHAR(36) NOT NULL PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await promisePool.query(createTableSQL);
    console.log('user_settings表创建成功！');
    
    // 验证表结构
    const [rows] = await promisePool.query('DESCRIBE user_settings');
    console.log('表结构:');
    console.table(rows);
    
  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  } finally {
    await promisePool.end();
  }
}

migrate().then(() => {
  console.log('迁移完成！');
}).catch(err => {
  console.error('迁移出错:', err);
  process.exit(1);
});
