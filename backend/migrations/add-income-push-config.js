const { promisePool } = require('../config/db');

async function migrate() {
  console.log('开始迁移：创建 income_push_config 表...');

  try {
    const [tables] = await promisePool.query(
      "SHOW TABLES LIKE 'income_push_config'"
    );

    if (tables.length > 0) {
      console.log('income_push_config 表已存在，跳过迁移');
      return;
    }

    await promisePool.query(`
      CREATE TABLE income_push_config (
        id CHAR(36) NOT NULL PRIMARY KEY,
        target VARCHAR(50) NOT NULL COMMENT '推送目标（zxx/小菲）',
        device_key VARCHAR(255) DEFAULT '' COMMENT 'Bark设备key',
        item_name VARCHAR(100) NOT NULL COMMENT '项目名称（工资/兼职/其他）',
        item_type VARCHAR(50) NOT NULL DEFAULT 'other' COMMENT '类型（salary/freelance/other）',
        push_time VARCHAR(5) DEFAULT '10:00' COMMENT '推送时间',
        push_day INT DEFAULT 15 COMMENT '推送日期（每月几号，工资用）',
        amount DECIMAL(12,2) DEFAULT 0 COMMENT '金额',
        salary_details JSON NULL COMMENT '工资明细JSON',
        push_message TEXT NULL COMMENT '自定义推送消息模板',
        enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_target (target),
        INDEX idx_enabled (enabled),
        INDEX idx_item_type (item_type)
      )
    `);

    console.log('income_push_config 表创建成功');
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
