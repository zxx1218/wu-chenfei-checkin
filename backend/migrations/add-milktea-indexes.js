const { promisePool } = require('../config/db');

async function addIndexes() {
  try {
    console.log('Adding indexes to milktea_records table...');
    
    // 检查索引是否已存在，如果不存在则创建
    const indexesToCreate = [
      { name: 'idx_date', columns: 'date' },
      { name: 'idx_type', columns: 'type' },
      { name: 'idx_drinker', columns: 'drinker' },
      { name: 'idx_created_at', columns: 'created_at DESC' },
      { name: 'idx_date_type', columns: 'date, type' },
      { name: 'idx_date_type_drinker', columns: 'date, type, drinker' }
    ];
    
    for (const index of indexesToCreate) {
      // 检查索引是否存在
      const [existing] = await promisePool.query(
        `SELECT COUNT(*) as count FROM information_schema.statistics 
         WHERE table_schema = DATABASE() 
         AND table_name = 'milktea_records' 
         AND index_name = ?`,
        [index.name]
      );
      
      if (existing[0].count === 0) {
        await promisePool.query(`CREATE INDEX ${index.name} ON milktea_records(${index.columns})`);
        console.log(`✓ Created index ${index.name} on (${index.columns})`);
      } else {
        console.log(`⊘ Index ${index.name} already exists, skipping`);
      }
    }
    
    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  addIndexes()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addIndexes;