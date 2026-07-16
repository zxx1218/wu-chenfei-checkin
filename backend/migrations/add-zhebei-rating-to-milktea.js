require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'checkin_db',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    console.log('Starting migration: Add zhebei_rating to milktea_records...');

    // Check if column already exists
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'milktea_records' 
       AND COLUMN_NAME = 'zhebei_rating'`,
      [process.env.DB_NAME || 'checkin_db']
    );

    if (columns.length > 0) {
      console.log('Column zhebei_rating already exists, skipping...');
      return;
    }

    // Add the column
    await pool.query(`
      ALTER TABLE milktea_records 
      ADD COLUMN zhebei_rating VARCHAR(20) NULL 
      COMMENT '这杯奶茶评价: 夯爆了/中不溜/拉完了'
      AFTER drinker
    `);

    console.log('✓ Successfully added zhebei_rating column to milktea_records');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
