const { v4: uuidv4 } = require('uuid');
const loggerHelper = require('../utils/loggerHelper');

/**
 * API请求日志中间件
 * 自动记录所有HTTP请求的详细信息（含请求追踪ID、耗时、UA等）
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // 生成或复用请求ID
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  
  // 跳过静态资源和健康检查的日志
  if (req.path.startsWith('/favicon') || req.path === '/health') {
    return next();
  }

  res.on('finish', () => {
    try {
      loggerHelper.logApiRequest(req, res, startTime);
    } catch (error) {
      // 日志记录失败不应影响主流程
      process.stderr.write(`Failed to log request: ${error.message}\n`);
    }
  });
  
  next();
}

/**
 * 可选：跳过某些路径的日志记录
 */
function requestLoggerWithSkip(skipPaths = []) {
  return (req, res, next) => {
    const shouldSkip = skipPaths.some(p => {
      if (typeof p === 'string') return req.path === p;
      if (p instanceof RegExp) return p.test(req.path);
      return false;
    });
    
    if (shouldSkip) return next();
    return requestLogger(req, res, next);
  };
}

module.exports = requestLogger;
module.exports.requestLoggerWithSkip = requestLoggerWithSkip;
