const logger = require('../config/logger');

async function testLogger() {
  console.log('=== 开始测试日志系统 ===\n');
  
  // 测试不同级别的日志
  logger.info('这是一条信息日志');
  logger.warn('这是一条警告日志');
  logger.error('这是一条错误日志');
  logger.debug('这是一条调试日志（仅在开发环境可见）');
  
  // 测试带元数据的日志
  logger.info('用户操作示例', { 
    userId: '12345', 
    action: 'create_record',
    timestamp: new Date().toISOString()
  });
  
  // 测试错误对象日志
  try {
    throw new Error('测试错误');
  } catch (error) {
    logger.error('捕获到错误:', error);
  }
  
  console.log('\n=== 日志测试完成 ===');
  console.log('请检查 backend/logs/ 目录下的日志文件');
}

testLogger().catch(console.error);
