const { promisePool } = require('./config/db');

async function addVideoColumn() {
  try {
    console.log('开始添加video_url字段到doi_records表...');
    
    // 检查字段是否已经存在
    const [columns] = await promisePool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'doi_records' 
      AND COLUMN_NAME = 'video_url'
    `);
    
    if (columns.length > 0) {
      console.log('video_url字段已存在');
      return;
    }
    
    // 添加video_url字段
    await promisePool.query(`
      ALTER TABLE doi_records 
      ADD COLUMN video_url VARCHAR(500) NULL DEFAULT NULL
    `);
    
    console.log('成功添加video_url字段到doi_records表');
  } catch (error) {
    console.error('添加video_url字段失败:', error);
    throw error;
  }
}

if (require.main === module) {
  addVideoColumn()
    .then(() => {
      console.log('迁移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移失败:', error);
      process.exit(1);
    });
}

module.exports = { addVideoColumn };