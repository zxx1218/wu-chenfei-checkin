const fs = require('fs');
const path = require('path');
const loggerHelper = require('../utils/loggerHelper');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const RETENTION_MS = 3 * 24 * 60 * 60 * 1000; // 3天

/**
 * 清理过期日志文件
 * 扫描日志目录，删除超过保留期限的文件
 */
async function cleanupOldLogs() {
  const startTime = Date.now();
  loggerHelper.logCleanup('开始清理过期日志', { 
    logDir: LOG_DIR, 
    retentionDays: 3 
  });

  try {
    if (!fs.existsSync(LOG_DIR)) {
      loggerHelper.logCleanup('日志目录不存在，跳过清理');
      return { deleted: 0, errors: 0, freedBytes: 0 };
    }

    const files = fs.readdirSync(LOG_DIR);
    const now = Date.now();
    let deleted = 0;
    let errors = 0;
    let freedBytes = 0;

    for (const file of files) {
      const filePath = path.join(LOG_DIR, file);
      
      try {
        const stat = fs.statSync(filePath);
        const age = now - stat.mtimeMs;

        if (age > RETENTION_MS) {
          const size = stat.size;
          fs.unlinkSync(filePath);
          deleted++;
          freedBytes += size;
          loggerHelper.logCleanup('删除过期日志', { 
            file, 
            age: `${Math.floor(age / (24 * 60 * 60 * 1000))}天`,
            size: `${(size / 1024).toFixed(1)}KB`
          });
        }
      } catch (err) {
        errors++;
        loggerHelper.logError(`清理日志文件失败: ${file}`, err);
      }
    }

    const duration = Date.now() - startTime;
    loggerHelper.logCleanup('日志清理完成', {
      scannedFiles: files.length,
      deleted,
      errors,
      freedBytes: `${(freedBytes / 1024).toFixed(1)}KB`,
      duration: `${duration}ms`,
    });

    return { deleted, errors, freedBytes };
  } catch (err) {
    loggerHelper.logError('日志清理任务失败', err, [
      '检查日志目录权限',
      '确认日志目录路径正确',
    ]);
    return { deleted: 0, errors: 1, freedBytes: 0 };
  }
}

module.exports = { cleanupOldLogs };
