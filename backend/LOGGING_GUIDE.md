# 日志系统使用指南

## 📋 概述

本项目使用统一的日志辅助工具 (`loggerHelper`) 来记录结构化、易读的日志信息。所有日志都包含时间戳、操作类型、关键参数和性能指标，便于问题排查和系统监控。

## 🎯 核心特性

- ✅ **结构化输出**：统一的日志格式，包含分隔线、emoji标识、缩进等视觉元素
- ✅ **自动API日志**：中间件自动记录所有HTTP请求的详细信息
- ✅ **性能监控**：自动计算并记录操作耗时
- ✅ **错误追踪**：详细的错误上下文、堆栈信息和解决建议
- ✅ **敏感信息过滤**：自动过滤密码、token等敏感字段
- ✅ **日志轮转**：按日期轮转，自动保留3天

## 📁 文件结构

```
backend/
├── config/
│   └── logger.js              # Winston日志配置
├── utils/
│   └── loggerHelper.js        # 统一日志辅助工具
├── middlewares/
│   └── requestLogger.js       # API请求日志中间件
└── logs/                      # 日志文件目录（自动生成）
    ├── application-YYYY-MM-DD.log
    └── error-YYYY-MM-DD.log
```

## 🔧 使用方法

### 1. API请求日志（自动）

无需手动调用，中间件会自动记录所有API请求：

```javascript
// 在 server.js 中已注册
const requestLogger = require('./middlewares/requestLogger');
app.use(requestLogger);
```

**输出示例：**
```
========================================
🌐 [API请求] POST /api/milktea-records
========================================
⏰ 时间: 2024-01-15 10:30:45
🆔 请求ID: abc-123-def-456
📍 路由: POST /api/milktea-records
👤 IP地址: 192.168.1.100
⚙️  参数: {}
📦 请求体: {"date":"2024年1月15日","type":"milktea"...}
----------------------------------------
✅ 状态码: 201
⏱️  耗时: 125 ms
========================================
```

### 2. 数据库操作日志

```javascript
const loggerHelper = require('../utils/loggerHelper');

// 在路由或Model中使用
router.post('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const record = await Model.create(req.body);
    
    loggerHelper.logDatabaseOperation(
      'CREATE',           // 操作类型: CREATE, READ, UPDATE, DELETE, FIND
      'table_name',       // 表名
      req.body,           // 操作数据
      { success: true, id: record.id },  // 操作结果
      startTime           // 开始时间戳
    );
    
    res.status(201).json({ data: record });
  } catch (error) {
    loggerHelper.logError('创建记录失败', error);
    res.status(500).json({ error: error.message });
  }
});
```

**输出示例：**
```
========================================
➕ [数据库操作] CREATE - milktea_records
========================================
⏰ 时间: 2024-01-15 10:30:45
📊 操作: CREATE
📁 表名: milktea_records
📝 数据: {"date":"2024年1月15日","type":"milktea"}
----------------------------------------
✅ 结果: 成功
🆔 记录ID: uuid-xxx-xxx
⏱️  耗时: 45 ms
========================================
```

### 3. 业务流程日志

```javascript
// 记录业务逻辑的关键步骤
loggerHelper.logBusinessProcess(
  'ModuleName',          // 模块名称
  'Action Description',  // 操作描述
  { key: 'value' },      // 详细信息
  'info'                 // 日志级别: info, warn, error
);
```

**输出示例：**
```
========================================
🔄 [业务流程] AutoCheckin - 检查用户记录
========================================
⏰ 时间: 2024-01-15 00:01:00
📦 模块: AutoCheckin
🎯 操作: 检查用户记录
----------------------------------------
📋 详情:
{
  "drinker": "小菲",
  "date": "2024年1月14日"
}
========================================
```

### 4. 定时任务日志

```javascript
// 定时任务开始时
loggerHelper.logScheduledTask(
  'TaskName',            // 任务名称
  { stats: 'data' },     // 统计信息
  'start'                // 阶段: start, progress, end
);

// 定时任务结束时
loggerHelper.logScheduledTask(
  'TaskName',
  { 
    success: true,
    processedCount: 10,
    duration: 1234
  },
  'end'
);
```

**输出示例：**
```
========================================
🚀 [定时任务] DailyWeatherPush - 开始执行
========================================
⏰ 时间: 2024-01-15 07:00:00
📋 任务: DailyWeatherPush
📊 阶段: start
----------------------------------------
📈 统计信息:
{}
========================================
```

### 5. 错误日志（带解决建议）

```javascript
try {
  // 可能出错的代码
} catch (error) {
  loggerHelper.logError(
    '错误发生的上下文描述',
    error,
    [
      '解决建议1：检查数据库连接',
      '解决建议2：验证参数格式',
      '解决建议3：查看相关文档'
    ]
  );
}
```

**输出示例：**
```
========================================
❌ [错误发生] 创建奶茶记录失败
========================================
⏰ 时间: 2024-01-15 10:30:45
📍 上下文: 创建奶茶记录失败
🔴 错误类型: ValidationError
💬 错误消息: date字段不能为空
📚 堆栈跟踪:
Error: date字段不能为空
    at MilkteaRecord.create (...)
    ...
💡 解决建议:
   1. 验证请求参数是否完整（date、time等必填字段）
   2. 检查数据库约束是否满足
   3. 确认MinIO存储服务是否正常
========================================
```

### 6. 性能监控日志

```javascript
const startTime = Date.now();
// 执行某个操作...
const duration = Date.now() - startTime;

loggerHelper.logPerformance(
  'OperationName',        // 操作名称
  duration,               // 耗时（毫秒）
  { additional: 'metrics' }  // 其他指标
);
```

**输出示例：**
```
========================================
⚡ [性能监控] WeatherAPI_GetWeather
========================================
⏰ 时间: 2024-01-15 10:30:45
🎯 操作: WeatherAPI_GetWeather
⏱️  耗时: 234 ms
📊 性能等级: 快速
----------------------------------------
📈 其他指标:
{
  "statusCode": 200,
  "location": "30.8703,120.1094"
}
========================================
```

## 📊 日志级别说明

| 级别 | 使用场景 | Emoji标识 |
|------|---------|----------|
| `info` | 正常业务流程、成功操作 | ✅ |
| `warn` | 警告信息、非致命错误 | ⚠️ |
| `error` | 错误、异常、失败操作 | ❌ |
| `debug` | 调试信息（开发环境） | 🔍 |

## 🎨 日志图标映射

### API请求
- 🌐 API请求
- ✅ 成功响应
- ⚠️ 客户端错误（4xx）
- ❌ 服务器错误（5xx）

### 数据库操作
- ➕ CREATE / INSERT
- 📖 READ
- ✏️ UPDATE
- 🗑️ DELETE
- 🔍 FIND

### 业务流程
- 🔄 业务流程
- 👤 用户行为
- 📦 模块操作

### 定时任务
- 🚀 任务开始
- ⚙️ 任务进行中
- ✅ 任务完成

### 性能监控
- ⚡ 快速（<500ms）
- 🚶 一般（500-1000ms）
- 🐢 缓慢（>1000ms）

## 🔒 安全特性

### 敏感信息过滤
自动过滤以下字段：
- `password`
- `token`
- `secret`
- `authorization`

这些字段在日志中会显示为 `***FILTERED***`

### 大数据截断
- 请求体超过200字符会被截断
- 复杂对象序列化时限制深度
- 循环引用检测并标记为 `[Circular]`

## 📝 最佳实践

### 1. 始终传递 startTime
```javascript
const startTime = Date.now();
try {
  // 业务逻辑
  loggerHelper.logDatabaseOperation(..., startTime);
} catch (error) {
  loggerHelper.logError(...);
}
```

### 2. 提供有意义的上下文
```javascript
// ❌ 不好的做法
loggerHelper.logError('失败', error);

// ✅ 好的做法
loggerHelper.logError('创建奶茶记录失败', error, [
  '验证date和time字段是否提供',
  '检查图片上传是否成功'
]);
```

### 3. 选择合适的日志级别
```javascript
// 预期内的情况使用 warn
if (!record) {
  loggerHelper.logBusinessProcess(..., 'warn');
}

// 真正的错误使用 error
catch (error) {
  loggerHelper.logError(...);
}
```

### 4. 记录关键业务节点
```javascript
// 在重要决策点记录
if (condition) {
  loggerHelper.logBusinessProcess(
    'Module',
    '选择了分支A',
    { reason: '...' }
  );
}
```

## 🔍 日志查询技巧

### 查看今天的日志
```bash
cat backend/logs/application-$(date +%Y-%m-%d).log
```

### 查看错误日志
```bash
cat backend/logs/error-$(date +%Y-%m-%d).log
```

### 搜索特定请求
```bash
grep "请求ID: abc-123" backend/logs/application-*.log
```

### 实时监控日志
```bash
tail -f backend/logs/application-$(date +%Y-%m-%d).log
```

## ⚙️ 配置选项

### 环境变量
```bash
# .env 文件
LOG_LEVEL=info  # error, warn, info, debug
NODE_ENV=production  # production, development
```

### 日志保留策略
- 保留天数：3天
- 单文件大小：20MB
- 自动压缩：是（.gz格式）

## 🚀 迁移指南

### 从旧日志系统迁移

**之前：**
```javascript
const logger = require('../config/logger');
logger.info('创建记录');
logger.error('失败:', error);
```

**现在：**
```javascript
const loggerHelper = require('../utils/loggerHelper');

const startTime = Date.now();
try {
  const record = await Model.create(data);
  loggerHelper.logDatabaseOperation(
    'CREATE',
    'table',
    data,
    { success: true, id: record.id },
    startTime
  );
} catch (error) {
  loggerHelper.logError('创建记录失败', error, ['建议1', '建议2']);
}
```

## 📖 更多资源

- [Winston文档](https://github.com/winstonjs/winston)
- [项目日志规范记忆](memory://92bed0dc-1de7-4404-8b4a-4be66b78a6e3)
- [统一日志记录规范](memory://新创建的日志规范记忆ID)

---

**最后更新**: 2024-01-15
**维护者**: 开发团队
