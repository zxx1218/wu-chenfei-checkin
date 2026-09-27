const logger = require('../config/logger');

/**
 * 统一日志辅助工具
 * 提供结构化、易读的日志记录方法
 */

// 分隔线样式
const SEPARATOR = '========================================';
const SUB_SEPARATOR = '----------------------------------------';

/**
 * 格式化时间戳
 */
function formatTimestamp() {
  const now = new Date();
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * 安全地序列化对象为JSON字符串
 */
function safeJsonStringify(obj, indent = 2) {
  try {
    if (obj === null || obj === undefined) {
      return String(obj);
    }
    // 处理循环引用和特殊类型
    const cache = new Set();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        // 过滤敏感字段
        if (['password', 'token', 'secret', 'authorization'].includes(key.toLowerCase())) {
          return '***FILTERED***';
        }
        return value;
      },
      indent
    );
  } catch (error) {
    return `[无法序列化: ${error.message}]`;
  }
}

/**
 * 计算耗时（毫秒）
 */
function calculateDuration(startTime) {
  if (!startTime) return 'N/A';
  const duration = Date.now() - startTime;
  return `${duration} ms`;
}

/**
 * API请求日志
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {number} startTime - 请求开始时间戳
 */
function logApiRequest(req, res, startTime) {
  const timestamp = formatTimestamp();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const statusCode = res.statusCode;
  const duration = calculateDuration(startTime);
  const requestId = req.headers['x-request-id'] || req.id || 'N/A';
  
  // 根据状态码选择emoji
  let statusEmoji = '✅';
  if (statusCode >= 400 && statusCode < 500) {
    statusEmoji = '⚠️';
  } else if (statusCode >= 500) {
    statusEmoji = '❌';
  }

  const logMessage = `
${SEPARATOR}
🌐 [API请求] ${method} ${url}
${SEPARATOR}
⏰ 时间: ${timestamp}
🆔 请求ID: ${requestId}
📍 路由: ${method} ${url}
👤 IP地址: ${req.ip || req.connection.remoteAddress}
⚙️  参数: ${safeJsonStringify(req.query)}
📦 请求体: ${safeJsonStringify(req.body, 0).substring(0, 200)}${req.body && Object.keys(req.body).length > 0 ? '...' : ''}
${SUB_SEPARATOR}
${statusEmoji} 状态码: ${statusCode}
⏱️  耗时: ${duration}
${SEPARATOR}`;

  // 根据状态码选择日志级别
  if (statusCode >= 500) {
    logger.error(logMessage);
  } else if (statusCode >= 400) {
    logger.warn(logMessage);
  } else {
    logger.info(logMessage);
  }
}

/**
 * 数据库操作日志
 * @param {string} operation - 操作类型 (CREATE, READ, UPDATE, DELETE)
 * @param {string} table - 表名
 * @param {Object} data - 操作数据
 * @param {Object} result - 操作结果
 * @param {number} startTime - 操作开始时间戳
 */
function logDatabaseOperation(operation, table, data, result, startTime) {
  const timestamp = formatTimestamp();
  const duration = calculateDuration(startTime);
  
  // 操作图标映射
  const operationIcons = {
    CREATE: '➕',
    READ: '📖',
    UPDATE: '✏️',
    DELETE: '🗑️',
    FIND: '🔍',
    INSERT: '➕'
  };
  
  const icon = operationIcons[operation.toUpperCase()] || '💾';
  
  // 数据摘要（避免过长）
  let dataSummary = '';
  if (data) {
    const dataStr = safeJsonStringify(data, 0);
    dataSummary = dataStr.length > 300 ? dataStr.substring(0, 300) + '...' : dataStr;
  }

  const logMessage = `
${SEPARATOR}
${icon} [数据库操作] ${operation} - ${table}
${SEPARATOR}
⏰ 时间: ${timestamp}
📊 操作: ${operation}
📁 表名: ${table}
📝 数据: ${dataSummary}
${SUB_SEPARATOR}
✅ 结果: ${result.success ? '成功' : '失败'}
${result.count !== undefined ? `📈 影响行数: ${result.count}\n` : ''}${result.id ? `🆔 记录ID: ${result.id}\n` : ''}${result.data ? `📋 返回数据: ${safeJsonStringify(result.data, 0).substring(0, 200)}...\n` : ''}⏱️  耗时: ${duration}
${SEPARATOR}`;

  if (!result.success) {
    logger.error(logMessage);
  } else {
    logger.info(logMessage);
  }
}

/**
 * 业务流程日志
 * @param {string} module - 模块名称
 * @param {string} action - 操作描述
 * @param {Object} details - 详细信息
 * @param {string} level - 日志级别 (info, warn, error)
 */
function logBusinessProcess(module, action, details = {}, level = 'info') {
  const timestamp = formatTimestamp();
  
  const logMessage = `
${SEPARATOR}
🔄 [业务流程] ${module} - ${action}
${SEPARATOR}
⏰ 时间: ${timestamp}
📦 模块: ${module}
🎯 操作: ${action}
${SUB_SEPARATOR}
📋 详情:
${safeJsonStringify(details)}
${SEPARATOR}`;

  logger[level](logMessage);
}

/**
 * 定时任务日志
 * @param {string} taskName - 任务名称
 * @param {Object} stats - 统计信息
 * @param {string} phase - 阶段 (start, end, progress)
 */
function logScheduledTask(taskName, stats = {}, phase = 'progress') {
  const timestamp = formatTimestamp();
  
  let phaseIcon = '⚙️';
  if (phase === 'start') {
    phaseIcon = '🚀';
  } else if (phase === 'end') {
    phaseIcon = '✅';
  }

  const logMessage = `
${SEPARATOR}
${phaseIcon} [定时任务] ${taskName} - ${phase === 'start' ? '开始执行' : phase === 'end' ? '执行完成' : '执行中'}
${SEPARATOR}
⏰ 时间: ${timestamp}
📋 任务: ${taskName}
📊 阶段: ${phase}
${SUB_SEPARATOR}
📈 统计信息:
${safeJsonStringify(stats)}
${SEPARATOR}`;

  if (phase === 'end' && stats.failed > 0) {
    logger.warn(logMessage);
  } else {
    logger.info(logMessage);
  }
}

/**
 * 错误日志（带上下文和建议）
 * @param {string} context - 错误发生的上下文
 * @param {Error} error - 错误对象
 * @param {Array<string>} suggestions - 解决建议列表
 */
function logError(context, error, suggestions = []) {
  const timestamp = formatTimestamp();
  
  const suggestionsText = suggestions.length > 0 
    ? `\n💡 解决建议:\n${suggestions.map((s, i) => `   ${i + 1}. ${s}`).join('\n')}`
    : '';

  const logMessage = `
${SEPARATOR}
❌ [错误发生] ${context}
${SEPARATOR}
⏰ 时间: ${timestamp}
📍 上下文: ${context}
🔴 错误类型: ${error.name || 'Unknown'}
💬 错误消息: ${error.message}
📚 堆栈跟踪:
${error.stack || 'No stack trace available'}${suggestionsText}
${SEPARATOR}`;

  logger.error(logMessage);
}

/**
 * 性能监控日志
 * @param {string} operation - 操作名称
 * @param {number} duration - 耗时（毫秒）
 * @param {Object} metrics - 其他指标
 */
function logPerformance(operation, duration, metrics = {}) {
  const timestamp = formatTimestamp();
  
  // 根据耗时选择颜色标识
  let performanceIcon = '⚡';
  let performanceLevel = '快速';
  if (duration > 1000) {
    performanceIcon = '🐢';
    performanceLevel = '缓慢';
  } else if (duration > 500) {
    performanceIcon = '🚶';
    performanceLevel = '一般';
  }

  const logMessage = `
${SEPARATOR}
${performanceIcon} [性能监控] ${operation}
${SEPARATOR}
⏰ 时间: ${timestamp}
🎯 操作: ${operation}
⏱️  耗时: ${duration} ms
📊 性能等级: ${performanceLevel}
${SUB_SEPARATOR}
📈 其他指标:
${safeJsonStringify(metrics)}
${SEPARATOR}`;

  if (duration > 1000) {
    logger.warn(logMessage);
  } else {
    logger.info(logMessage);
  }
}

/**
 * 用户行为日志
 * @param {string} userId - 用户ID
 * @param {string} action - 行为描述
 * @param {Object} metadata - 元数据
 */
function logUserAction(userId, action, metadata = {}) {
  const timestamp = formatTimestamp();

  const logMessage = `
${SEPARATOR}
👤 [用户行为] ${action}
${SEPARATOR}
⏰ 时间: ${timestamp}
🆔 用户ID: ${userId}
🎯 行为: ${action}
${SUB_SEPARATOR}
📋 元数据:
${safeJsonStringify(metadata)}
${SEPARATOR}`;

  logger.info(logMessage);
}

module.exports = {
  logApiRequest,
  logDatabaseOperation,
  logBusinessProcess,
  logScheduledTask,
  logError,
  logPerformance,
  logUserAction,
  SEPARATOR,
  SUB_SEPARATOR
};
