/**
 * 日志系统使用示例
 * 演示如何使用统一的日志辅助工具
 */

const loggerHelper = require('./utils/loggerHelper');

// ========================================
// 示例1: API请求日志（自动，无需手动调用）
// ========================================
console.log('\n=== 示例1: API请求日志 ===');
console.log('中间件会自动记录所有HTTP请求，见 server.js 配置');

// ========================================
// 示例2: 数据库操作日志
// ========================================
console.log('\n=== 示例2: 数据库操作日志 ===');

function simulateDatabaseOperation() {
  const startTime = Date.now();
  
  // 模拟数据库操作
  setTimeout(() => {
    loggerHelper.logDatabaseOperation(
      'CREATE',
      'users',
      { name: '张三', email: 'zhangsan@example.com' },
      { success: true, id: 'user-123' },
      startTime
    );
  }, 100);
}

simulateDatabaseOperation();

// ========================================
// 示例3: 业务流程日志
// ========================================
console.log('\n=== 示例3: 业务流程日志 ===');

loggerHelper.logBusinessProcess(
  'UserRegistration',
  '开始用户注册流程',
  { 
    username: 'lisi',
    email: 'lisi@example.com',
    step: 1
  },
  'info'
);

loggerHelper.logBusinessProcess(
  'UserRegistration',
  '邮箱验证失败',
  { 
    username: 'lisi',
    reason: '邮箱格式不正确'
  },
  'warn'
);

// ========================================
// 示例4: 定时任务日志
// ========================================
console.log('\n=== 示例4: 定时任务日志 ===');

loggerHelper.logScheduledTask(
  'DataBackup',
  { 
    totalRecords: 1000,
    backupPath: '/backups/2024-01-15'
  },
  'start'
);

setTimeout(() => {
  loggerHelper.logScheduledTask(
    'DataBackup',
    { 
      success: true,
      backedUpCount: 1000,
      failedCount: 0,
      duration: 5000
    },
    'end'
  );
}, 200);

// ========================================
// 示例5: 错误日志（带解决建议）
// ========================================
console.log('\n=== 示例5: 错误日志 ===');

try {
  throw new Error('数据库连接超时');
} catch (error) {
  loggerHelper.logError(
    '数据库连接失败',
    error,
    [
      '检查数据库服务是否正常运行',
      '验证连接字符串是否正确',
      '确认网络连接权限配置',
      '查看数据库日志获取更多信息'
    ]
  );
}

// ========================================
// 示例6: 性能监控日志
// ========================================
console.log('\n=== 示例6: 性能监控日志 ===');

const operationStart = Date.now();
setTimeout(() => {
  const duration = Date.now() - operationStart;
  
  loggerHelper.logPerformance(
    'ComplexQuery',
    duration,
    {
      tableName: 'orders',
      recordCount: 5000,
      cacheHit: false
    }
  );
}, 300);

// ========================================
// 示例7: 用户行为日志
// ========================================
console.log('\n=== 示例7: 用户行为日志 ===');

loggerHelper.logUserAction(
  'user-456',
  '登录系统',
  {
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    loginMethod: 'password'
  }
);

// ========================================
// 示例8: 敏感信息过滤
// ========================================
console.log('\n=== 示例8: 敏感信息过滤 ===');

loggerHelper.logBusinessProcess(
  'Authentication',
  '用户登录',
  {
    username: 'admin',
    password: 'secret123',  // 会被自动过滤为 ***FILTERED***
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // 也会被过滤
    timestamp: new Date().toISOString()
  },
  'info'
);

// ========================================
// 示例9: 完整的API处理流程
// ========================================
console.log('\n=== 示例9: 完整的API处理流程 ===');

function simulateAPIHandler(req, res) {
  const startTime = Date.now();
  
  console.log('接收请求...');
  
  // 业务逻辑
  setTimeout(() => {
    try {
      // 模拟数据处理
      const result = { id: 'record-789', status: 'success' };
      
      // 记录数据库操作
      loggerHelper.logDatabaseOperation(
        'CREATE',
        'records',
        req.body,
        { success: true, id: result.id },
        startTime
      );
      
      // 返回响应
      res.statusCode = 201;
      console.log('请求处理完成');
      
    } catch (error) {
      loggerHelper.logError('API处理失败', error, [
        '检查请求参数格式',
        '验证业务逻辑是否正确'
      ]);
      res.statusCode = 500;
    }
  }, 150);
}

// 模拟调用
simulateAPIHandler(
  { body: { name: '测试记录', value: 100 } },
  { statusCode: 200 }
);

// ========================================
// 示例10: 多级嵌套对象日志
// ========================================
console.log('\n=== 示例10: 复杂数据结构日志 ===');

const complexData = {
  user: {
    id: 'user-123',
    profile: {
      name: '王五',
      preferences: {
        theme: 'dark',
        language: 'zh-CN'
      }
    }
  },
  orders: [
    { id: 'order-1', amount: 100 },
    { id: 'order-2', amount: 200 }
  ],
  metadata: {
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }
};

loggerHelper.logBusinessProcess(
  'DataExport',
  '导出用户数据',
  complexData,
  'info'
);

console.log('\n✅ 所有示例已执行，请查看日志输出');
console.log('💡 提示：在生产环境中，日志会同时输出到控制台和文件');
console.log('📁 日志文件位置：backend/logs/\n');
