const { v4: uuidv4 } = require('uuid');
const loggerHelper = require('../utils/loggerHelper');

/**
 * API请求日志中间件
 * 自动记录所有HTTP请求的详细信息
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // 生成或获取请求ID（用于追踪）
  req.id = req.headers['x-request-id'] || uuidv4();
  
  // 在响应头中返回请求ID，方便前端追踪
  res.setHeader('X-Request-ID', req.id);
  
  // 监听响应完成事件
  res.on('finish', () => {
    try {
      loggerHelper.logApiRequest(req, res, startTime);
    } catch (error) {
      // 防止日志记录失败影响主流程
      console.error('Failed to log request:', error);
    }
  });
  
  next();
}

/**
 * 可选：跳过某些路径的日志记录
 * @param {Array<string>} skipPaths - 要跳过的路径列表
 */
function requestLoggerWithSkip(skipPaths = []) {
  return (req, res, next) => {
    // 检查是否应该跳过此路径
    const shouldSkip = skipPaths.some(path => {
      if (typeof path === 'string') {
        return req.path === path;
      }
      if (path instanceof RegExp) {
        return path.test(req.path);
      }
      return false;
    });
    
    if (shouldSkip) {
      return next();
    }
    
    return requestLogger(req, res, next);
  };
}

module.exports = requestLogger;
module.exports.requestLoggerWithSkip = requestLoggerWithSkip;
