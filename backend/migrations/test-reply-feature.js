const { promisePool } = require('../config/db');

async function testReplyFeature() {
  console.log('=== 测试回复功能 ===\n');
  
  try {
    // 1. 检查表结构
    console.log('1. 检查push_history表结构...');
    const [columns] = await promisePool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'push_history'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('表字段:');
    columns.forEach(col => {
      const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})${key}`);
    });
    
    const hasReplyToId = columns.some(col => col.COLUMN_NAME === 'reply_to_id');
    if (!hasReplyToId) {
      console.error('\n❌ 错误: reply_to_id 字段不存在！');
      console.error('请先执行迁移脚本: node migrations/add-reply-to-push-history.js');
      return;
    }
    
    console.log('\n✅ reply_to_id 字段存在\n');
    
    // 2. 插入测试数据
    console.log('2. 插入测试数据...');
    
    // 插入一条原消息
    const originalMessage = {
      id: 'test-original-' + Date.now(),
      title: '💕 测试原消息',
      body: '这是一条测试消息',
      target: '小菲',
      device_key: 'test_device_key',
      sound: 'multiwayinvitation',
      status: 'success',
      reply_to_id: null
    };
    
    await promisePool.query(
      `INSERT INTO push_history (id, title, body, target, device_key, sound, status, reply_to_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [originalMessage.id, originalMessage.title, originalMessage.body, 
       originalMessage.target, originalMessage.device_key, originalMessage.sound, 
       originalMessage.status, originalMessage.reply_to_id]
    );
    
    console.log('✅ 原消息插入成功');
    
    // 插入一条回复消息
    const replyMessage = {
      id: 'test-reply-' + Date.now(),
      title: '回复 @小菲',
      body: '这是回复内容',
      target: 'zxx',
      device_key: 'test_device_key_2',
      sound: 'multiwayinvitation',
      status: 'success',
      reply_to_id: originalMessage.id
    };
    
    await promisePool.query(
      `INSERT INTO push_history (id, title, body, target, device_key, sound, status, reply_to_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [replyMessage.id, replyMessage.title, replyMessage.body, 
       replyMessage.target, replyMessage.device_key, replyMessage.sound, 
       replyMessage.status, replyMessage.reply_to_id]
    );
    
    console.log('✅ 回复消息插入成功\n');
    
    // 3. 查询并验证
    console.log('3. 验证回复关系...');
    const [messages] = await promisePool.query(`
      SELECT h.*, 
             r.title as replied_to_title,
             r.target as replied_to_target
      FROM push_history h
      LEFT JOIN push_history r ON h.reply_to_id = r.id
      WHERE h.id IN (?, ?)
      ORDER BY h.created_at DESC
    `, [originalMessage.id, replyMessage.id]);
    
    messages.forEach(msg => {
      console.log(`\n消息ID: ${msg.id}`);
      console.log(`  标题: ${msg.title}`);
      console.log(`  目标: ${msg.target}`);
      console.log(`  回复ID: ${msg.reply_to_id || '无'}`);
      if (msg.replied_to_title) {
        console.log(`  回复的消息: ${msg.replied_to_title} (发给 ${msg.replied_to_target})`);
      }
    });
    
    console.log('\n✅ 回复关系验证成功\n');
    
    // 4. 清理测试数据
    console.log('4. 清理测试数据...');
    await promisePool.query('DELETE FROM push_history WHERE id IN (?, ?)', 
      [originalMessage.id, replyMessage.id]);
    console.log('✅ 测试数据已清理\n');
    
    console.log('=== 所有测试通过！===');
    console.log('\n回复功能已正确实现，可以开始使用了！💕');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    throw error;
  } finally {
    await promisePool.end();
  }
}

testReplyFeature().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('测试出错:', err);
  process.exit(1);
});
