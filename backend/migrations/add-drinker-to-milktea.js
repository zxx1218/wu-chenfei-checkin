const { promisePool } = require('../config/db');

async function addDrinkerColumn() {
  try {
    console.log('Checking if drinker column exists...');
    
    // 检查列是否已存在
    const [columns] = await promisePool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'milktea_records' 
        AND COLUMN_NAME = 'drinker'
    `);
    
    if (columns.length > 0) {
      console.log('drinker column already exists, skipping migration');
      return;
    }
    
    console.log('Adding drinker column to milktea_records table...');
    
    // 添加drinker字段
    await promisePool.query(`
      ALTER TABLE milktea_records 
      ADD COLUMN drinker VARCHAR(50) NULL AFTER image
    `);
    
    console.log('✓ drinker column added successfully');
  } catch (error) {
    console.error('Error adding drinker column:', error);
    throw error;
  }
}

addDrinkerColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
