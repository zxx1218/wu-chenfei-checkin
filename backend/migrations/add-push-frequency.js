const { promisePool } = require('../config/db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function migrate() {
  console.log('开始迁移：为 income_push_config 添加 push_frequency 字段...');

  try {
    const [columns] = await promisePool.query(
      "SHOW COLUMNS FROM income_push_config LIKE 'push_frequency'"
    );

    if (columns.length > 0) {
      console.log('push_frequency 字段已存在，跳过迁移');
      return;
    }

    await promisePool.query(
      "ALTER TABLE income_push_config ADD COLUMN push_frequency VARCHAR(20) DEFAULT 'daily' COMMENT '推送频率（daily/weekly/monthly）' AFTER push_day"
    );

    console.log('push_frequency 字段添加成功');
  } catch (error) {
    console.error('迁移失败:', error.message);
    throw error;
  }
}

if (require.main === module) {
  migrate()
    .then(() => { console.log('迁移完成'); process.exit(0); })
    .catch((err) => { console.error('迁移失败:', err); process.exit(1); });
}

module.exports = migrate;
