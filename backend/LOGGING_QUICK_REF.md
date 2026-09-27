# 日志系统快速参考

## 🚀 快速开始

### 1. 导入工具
```javascript
const loggerHelper = require('../utils/loggerHelper');
```

### 2. 记录数据库操作
```javascript
const startTime = Date.now();
const record = await Model.create(data);

loggerHelper.logDatabaseOperation(
  'CREATE',              // 操作类型
  'table_name',          // 表名
  data,                  // 数据
  { success: true, id: record.id },  // 结果
  startTime              // 开始时间
);
```

### 3. 记录错误
```javascript
try {
  // 业务逻辑
} catch (error) {
  loggerHelper.logError('错误描述', error, [
    '解决建议1',
    '解决建议2'
  ]);
}
```

### 4. 记录业务流程
```javascript
loggerHelper.logBusinessProcess(
  'ModuleName',          // 模块名
  'Action',              // 操作描述
  { detail: 'data' },    // 详情
  'info'                 // 级别: info/warn/error
);
```

## 📊 常用方法速查

| 方法 | 用途 | 必填参数 |
|------|------|---------|
| `logApiRequest` | API请求（自动） | req, res, startTime |
| `logDatabaseOperation` | 数据库操作 | operation, table, data, result, startTime |
| `logBusinessProcess` | 业务流程 | module, action, details |
| `logScheduledTask` | 定时任务 | taskName, stats, phase |
| `logError` | 错误日志 | context, error, suggestions |
| `logPerformance` | 性能监控 | operation, duration, metrics |
| `logUserAction` | 用户行为 | userId, action, metadata |

## 🎨 操作类型图标

- ➕ CREATE / INSERT
- 📖 READ
- ✏️ UPDATE
- 🗑️ DELETE
- 🔍 FIND

## ⚡ 性能等级

- ⚡ < 500ms（快速）
- 🚶 500-1000ms（一般）
- 🐢 > 1000ms（缓慢）

## 🔒 自动过滤字段

以下字段会自动替换为 `***FILTERED***`：
- password
- token
- secret
- authorization

## 📁 日志位置

```
backend/logs/
├── application-YYYY-MM-DD.log
└── error-YYYY-MM-DD.log
```

## 🔍 常用命令

```bash
# 查看今天日志
cat backend/logs/application-$(date +%Y-%m-%d).log

# 查看错误日志
cat backend/logs/error-$(date +%Y-%m-%d).log

# 实时监控
tail -f backend/logs/application-$(date +%Y-%m-%d).log

# 搜索特定请求
grep "请求ID: xxx" backend/logs/*.log
```

## 💡 最佳实践

1. ✅ **始终传递 startTime**
2. ✅ **提供有意义的上下文**
3. ✅ **添加解决建议**
4. ✅ **选择合适的日志级别**
5. ❌ **不要记录敏感信息**
6. ❌ **不要记录过大数据**

## 📖 完整文档

查看详细文档：[LOGGING_GUIDE.md](./LOGGING_GUIDE.md)

运行示例：`node test-logging.js`
