const logger = require('../config/logger');

/**
 * 统一日志辅助工具
 * 提供结构化、详细的日志记录方法
 */

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'authorization', 'cookie', 'session'];

/**
 * 安全序列化对象（过滤敏感字段、处理循环引用）
 */
function safeStringify(obj, maxLen = 500) {
  if (obj === null || obj === undefined) return String(obj);
  try {
    const seen = new WeakSet();
    const str = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
        return '***FILTERED***';
      }
      return value;
    });
    if (!str) return String(obj);
    return str.length > maxLen ? str.substring(0, maxLen) + `...[截断,总长${str.length}]` : str;
  } catch {
    return `[序列化失败]`;
  }
}

/**
 * API请求日志 - 记录完整的请求/响应信息
 */
function logApiRequest(req, res, startTime) {
  const duration = startTime ? Date.now() - startTime : 0;
  const statusCode = res.statusCode;
  const requestId = req.id || req.headers['x-request-id'] || '-';
  const userAgent = req.headers['user-agent'] || '-';
  const referer = req.headers['referer'] || req.headers['referrer'] || '-';
  const contentLength = res.getHeader('content-length') || '-';

  let level = 'info';
  let statusTag = 'OK';
  if (statusCode >= 500) { level = 'error'; statusTag = 'ERR'; }
  else if (statusCode >= 400) { level = 'warn'; statusTag = 'WARN'; }

  logger.log(level, `${req.method} ${req.originalUrl || req.url} → ${statusCode} (${duration}ms)`, {
    module: 'HTTP',
    type: 'api-request',
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode,
    statusTag,
    duration: `${duration}ms`,
    ip: req.ip || req.connection?.remoteAddress || '-',
    userAgent: userAgent.substring(0, 100),
    referer,
    contentLength,
    query: Object.keys(req.query || {}).length > 0 ? safeStringify(req.query, 200) : undefined,
    bodyKeys: req.body ? Object.keys(req.body).join(',') : undefined,
  });
}

/**
 * 数据库操作日志 - 记录CRUD操作详情
 */
function logDatabaseOperation(operation, table, data, result, startTime) {
  const duration = startTime ? Date.now() - startTime : 0;
  const icons = { CREATE: '➕', READ: '📖', UPDATE: '✏️', DELETE: '🗑️', FIND: '🔍', INSERT: '➕' };
  const icon = icons[operation.toUpperCase()] || '💾';

  const level = result.success ? (duration > 500 ? 'warn' : 'info') : 'error';

  logger.log(level, `${icon} DB.${operation} ${table} → ${result.success ? 'OK' : 'FAIL'} (${duration}ms)`, {
    module: 'Database',
    type: 'db-operation',
    operation: operation.toUpperCase(),
    table,
    duration: `${duration}ms`,
    success: result.success,
    affectedRows: result.count,
    recordId: result.id,
    dataSummary: data ? safeStringify(data, 300) : undefined,
    resultData: result.data ? safeStringify(result.data, 200) : undefined,
  });
}

/**
 * 业务流程日志 - 记录业务逻辑关键节点
 */
function logBusinessProcess(module, action, details = {}, level = 'info') {
  logger.log(level, `[${module}] ${action}`, {
    module,
    type: 'business-process',
    action,
    details: Object.keys(details).length > 0 ? safeStringify(details, 400) : undefined,
  });
}

/**
 * 定时任务日志 - 记录任务执行的完整生命周期
 */
function logScheduledTask(taskName, stats = {}, phase = 'progress') {
  const icons = { start: '🚀', end: '✅', progress: '⚙️' };
  const icon = icons[phase] || '⚙️';
  const phaseText = { start: '开始', end: '完成', progress: '执行中' };

  const level = phase === 'end' && stats.failCount > 0 ? 'warn' : 'info';

  logger.log(level, `${icon} 定时任务[${taskName}] ${phaseText[phase] || phase}`, {
    module: 'Scheduler',
    type: 'scheduled-task',
    taskName,
    phase,
    ...stats,
  });
}

/**
 * 错误日志 - 记录完整错误上下文和解决建议
 */
function logError(context, error, suggestions = []) {
  logger.error(`❌ ${context}: ${error.message || error}`, {
    module: 'Error',
    type: 'error',
    context,
    errorName: error.name || 'Unknown',
    errorMessage: error.message || String(error),
    errorCode: error.code,
    stack: error.stack,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  });
}

/**
 * 性能监控日志 - 记录操作耗时和性能指标
 */
function logPerformance(operation, duration, metrics = {}) {
  let level = 'info';
  let perfTag = 'FAST';
  if (duration > 1000) { level = 'warn'; perfTag = 'SLOW'; }
  else if (duration > 500) { perfTag = 'MEDIUM'; }

  logger.log(level, `⚡ 性能[${operation}] ${duration}ms (${perfTag})`, {
    module: 'Performance',
    type: 'performance',
    operation,
    duration: `${duration}ms`,
    perfTag,
    ...metrics,
  });
}

/**
 * 用户行为日志 - 记录用户操作审计
 */
function logUserAction(userId, action, metadata = {}) {
  logger.info(`👤 用户行为[${userId}] ${action}`, {
    module: 'Audit',
    type: 'user-action',
    userId,
    action,
    ...metadata,
  });
}

/**
 * 日志清理日志 - 记录日志清理操作
 */
function logCleanup(action, details = {}) {
  logger.info(`🧹 日志清理: ${action}`, {
    module: 'LogCleanup',
    type: 'log-cleanup',
    action,
    ...details,
  });
}

module.exports = {
  logApiRequest,
  logDatabaseOperation,
  logBusinessProcess,
  logScheduledTask,
  logError,
  logPerformance,
  logUserAction,
  logCleanup,
};
