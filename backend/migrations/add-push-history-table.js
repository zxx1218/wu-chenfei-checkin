const { promisePool } = require('../config/db');

async function migrate() {
  console.log('开始创建push_history表...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS push_history (
      id CHAR(36) NOT NULL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      target VARCHAR(50) NOT NULL,
      device_key VARCHAR(255),
      sound VARCHAR(100),
      status ENUM('success', 'failed') DEFAULT 'success'
    );
  `;
  
  try {
    await promisePool.query(createTableSQL);
    console.log('push_history表创建成功！');
    
    // 验证表结构
    const [rows] = await promisePool.query('DESCRIBE push_history');
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
