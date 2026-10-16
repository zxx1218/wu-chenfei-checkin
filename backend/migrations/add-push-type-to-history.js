const { promisePool } = require('../config/db');

async function migrate() {
  console.log('开始迁移：为 push_history 表添加 push_type 字段...');

  try {
    const [columns] = await promisePool.query(
      "SHOW COLUMNS FROM push_history LIKE 'push_type'"
    );

    if (columns.length > 0) {
      console.log('push_type 字段已存在，跳过迁移');
      return;
    }

    await promisePool.query(
      "ALTER TABLE push_history ADD COLUMN push_type VARCHAR(50) DEFAULT 'manual' AFTER status"
    );

    await promisePool.query(
      "CREATE INDEX idx_push_type ON push_history (push_type)"
    );

    console.log('push_type 字段添加成功');
  } catch (error) {
    console.error('迁移失败:', error.message);
    throw error;
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('迁移完成');
      process.exit(0);
    })
    .catch((err) => {
      console.error('迁移失败:', err);
      process.exit(1);
    });
}

module.exports = migrate;
