/**
 * 统一日志记录工具
 */
const winston = require('winston');

// 创建模块专用logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auto-checkin-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 如果不是生产环境，添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

class LoggerHelper {
  /**
   * 记录定时任务开始/结束
   * @param {string} taskName - 任务名称
   * @param {object} data - 相关数据
   * @param {string} status - 状态 ('start' | 'end')
   */
  logScheduledTask(taskName, data = {}, status = 'start') {
    const prefix = status === 'start' ? '▶️' : '⏹️';
    const message = status === 'start' 
      ? `${prefix} 定时任务开始: ${taskName}`
      : `${prefix} 定时任务结束: ${taskName}`;
    
    logger.info(message, {
      type: 'scheduled-task',
      taskName,
      status,
      ...data
    });
  }

  /**
   * 记录业务流程信息
   * @param {string} context - 上下文
   * @param {string} message - 消息
   * @param {object} data - 附加数据
   * @param {string} level - 日志级别 ('info' | 'warn')
   */
  logBusinessProcess(context, message, data = {}, level = 'info') {
    logger[level](`📌 业务流程: ${message}`, {
      type: 'business-process',
      context,
      ...data
    });
  }

  /**
   * 记录数据库操作
   * @param {string} operation - 操作类型 (CREATE, READ, UPDATE, DELETE)
   * @param {string} table - 表名
   * @param {object} criteria - 查询条件
   * @param {object} result - 结果
   * @param {number} startTime - 开始时间戳
   */
  logDatabaseOperation(operation, table, criteria, result, startTime) {
    const duration = Date.now() - startTime;
    logger.info(`🗄️ 数据库操作: ${operation} ${table}`, {
      type: 'database-operation',
      operation,
      table,
      criteria,
      result,
      duration: `${duration}ms`
    });
  }

  /**
   * 记录错误信息及解决方案建议
   * @param {string} message - 错误消息
   * @param {Error} error - 错误对象
   * @param {string[]} solutions - 解决方案建议
   */
  logError(message, error, solutions = []) {
    logger.error(`❌ ${message}`, {
      type: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      solutions,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new LoggerHelper();
const BumpRecord = require('../models/BumpRecord');
const MilkteaRecord = require('../models/MilkteaRecord');
const { v4: uuidv4 } = require('uuid');
const loggerHelper = require('../utils/loggerHelper');

class AutoCheckinService {
  // 获取昨天的日期字符串（中文格式）- 使用Asia/Shanghai时区
  static getYesterdayDateString() {
    const now = new Date();
    
    // 将当前时间转换为上海时区的时间
    const shanghaiTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
    const shanghaiDate = new Date(shanghaiTimeStr);
    
    // 减去一天得到昨天
    const yesterday = new Date(shanghaiDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return yesterday.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // 获取今天的日期字符串（中文格式）- 使用Asia/Shanghai时区
  static getTodayDateString() {
    const now = new Date();
    
    // 将当前时间转换为上海时区的时间
    const shanghaiTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
    const shanghaiDate = new Date(shanghaiTimeStr);
    
    return shanghaiDate.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // 自动为昨天添加安全签到记录
  static async autoSafeCheckin() {
    const startTime = Date.now();
    try {
      const yesterdayStr = this.getYesterdayDateString();
      
      loggerHelper.logScheduledTask(
        'AutoSafeCheckin',
        { targetDate: yesterdayStr },
        'start'
      );

      // 检查昨天是否已有bump记录
      const bumpRecords = await BumpRecord.findByDate(yesterdayStr);
      
      if (!bumpRecords || bumpRecords.length === 0) {
        loggerHelper.logBusinessProcess(
          'AutoSafeCheckin',
          `未找到${yesterdayStr}的碰记录，准备添加自动安全记录`,
          { date: yesterdayStr }
        );
        
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const record = await BumpRecord.create({
          date: yesterdayStr,
          time: time,
          type: 'safe',
          location: null,
          severity: null
        });
        
        loggerHelper.logDatabaseOperation(
          'CREATE',
          'bump_records',
          { date: yesterdayStr, type: 'safe', auto: true },
          { success: true, id: record.id },
          startTime
        );
      } else {
        loggerHelper.logBusinessProcess(
          'AutoSafeCheckin',
          `${yesterdayStr}已存在碰记录，跳过自动安全签到`,
          { date: yesterdayStr, count: bumpRecords.length },
          'info'
        );
      }

      // 检查昨天是否已有奶茶记录
      const milkteaRecords = await MilkteaRecord.findByDate(yesterdayStr);
      
      if (!milkteaRecords || milkteaRecords.length === 0) {
        loggerHelper.logBusinessProcess(
          'AutoSafeCheckin',
          `未找到${yesterdayStr}的奶茶记录，准备添加自动无奶茶记录`,
          { date: yesterdayStr }
        );
        
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const record = await MilkteaRecord.create({
          date: yesterdayStr,
          time: time,
          type: 'no_milktea',
          brand: null,
          drink_name: null
        });
        
        loggerHelper.logDatabaseOperation(
          'CREATE',
          'milktea_records',
          { date: yesterdayStr, type: 'no_milktea', auto: true },
          { success: true, id: record.id },
          startTime
        );
      } else {
        loggerHelper.logBusinessProcess(
          'AutoSafeCheckin',
          `${yesterdayStr}已存在奶茶记录，跳过自动无奶茶签到`,
          { date: yesterdayStr, count: milkteaRecords.length },
          'info'
        );
      }

      loggerHelper.logScheduledTask(
        'AutoSafeCheckin',
        { 
          success: true,
          date: yesterdayStr,
          duration: Date.now() - startTime
        },
        'end'
      );

      return {
        success: true,
        message: `Auto check-in completed for ${yesterdayStr}`,
        date: yesterdayStr
      };
    } catch (error) {
      loggerHelper.logError('自动签到服务执行失败', error, [
        '检查数据库连接是否正常',
        '确认BumpRecord和MilkteaRecord模型是否正确加载',
        '查看服务器时间和时区设置'
      ]);
      return {
        success: false,
        message: 'Auto check-in failed',
        error: error.message
      };
    }
  }

  // 每天0:01自动给未打卡的人打"今日很乖"
  static async autoNoMilkteaForToday() {
    const startTime = Date.now();
    try {
      const yesterdayStr = this.getYesterdayDateString();
      
      loggerHelper.logScheduledTask(
        'AutoNoMilkteaCheck',
        { 
          targetDate: yesterdayStr,
          serverTime: new Date().toISOString(),
          shanghaiTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
        },
        'start'
      );

      const drinkers = ['小菲', 'zxx'];
      const results = [];

      for (const drinker of drinkers) {
        loggerHelper.logBusinessProcess(
          'AutoNoMilkteaCheck',
          `检查用户 ${drinker} 的记录`,
          { drinker, date: yesterdayStr }
        );
        
        // 检查这个人昨天是否已有任何记录
        const existingRecords = await MilkteaRecord.findByDate(yesterdayStr);
        
        const personRecords = existingRecords.filter(r => r.drinker === drinker);

        if (personRecords.length === 0) {
          loggerHelper.logBusinessProcess(
            'AutoNoMilkteaCheck',
            `${drinker} 昨天无记录，添加自动无奶茶记录`,
            { drinker, date: yesterdayStr }
          );
          
          const now = new Date();
          const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' });
          
          const record = await MilkteaRecord.create({
            date: yesterdayStr,
            time: time,
            type: 'no_milktea',
            brand: null,
            drink_name: null,
            drinker: drinker
          });
          
          loggerHelper.logDatabaseOperation(
            'CREATE',
            'milktea_records',
            { date: yesterdayStr, drinker, type: 'no_milktea', auto: true },
            { success: true, id: record.id },
            startTime
          );
          
          results.push({
            drinker,
            action: 'added_auto_no_milktea',
            success: true
          });
        } else {
          loggerHelper.logBusinessProcess(
            'AutoNoMilkteaCheck',
            `${drinker} 昨天已有记录，跳过`,
            { drinker, date: yesterdayStr, recordCount: personRecords.length },
            'info'
          );
          results.push({
            drinker,
            action: 'skipped_has_records',
            success: true
          });
        }
      }

      loggerHelper.logScheduledTask(
        'AutoNoMilkteaCheck',
        { 
          success: true,
          date: yesterdayStr,
          totalUsers: drinkers.length,
          processedResults: results,
          duration: Date.now() - startTime
        },
        'end'
      );

      return {
        success: true,
        message: `Auto no-milktea check completed for ${yesterdayStr}`,
        date: yesterdayStr,
        results
      };
    } catch (error) {
      loggerHelper.logError('自动无奶茶检查失败', error, [
        '检查数据库连接是否正常',
        '确认时区设置是否正确（Asia/Shanghai）',
        '验证drinker列表配置'
      ]);
      return {
        success: false,
        message: 'Auto no-milktea check failed',
        error: error.message
      };
    }
  }

  // 每天0:01自动给未打卡的每日一碰打平安卡
  static async autoSafeBumpForToday() {
    const startTime = Date.now();
    try {
      const yesterdayStr = this.getYesterdayDateString();
      
      loggerHelper.logScheduledTask(
        'AutoSafeBumpCheck',
        { 
          targetDate: yesterdayStr,
          serverTime: new Date().toISOString(),
          shanghaiTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
        },
        'start'
      );

      // 检查昨天是否已有bump记录
      const existingRecords = await BumpRecord.findByDate(yesterdayStr);

      if (!existingRecords || existingRecords.length === 0) {
        loggerHelper.logBusinessProcess(
          'AutoSafeBumpCheck',
          `昨天无碰记录，添加自动安全记录`,
          { date: yesterdayStr }
        );
        
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' });
        
        const record = await BumpRecord.create({
          date: yesterdayStr,
          time: time,
          type: 'safe',
          location: null,
          severity: null
        });
        
        loggerHelper.logDatabaseOperation(
          'CREATE',
          'bump_records',
          { date: yesterdayStr, type: 'safe', auto: true },
          { success: true, id: record.id },
          startTime
        );
        
        loggerHelper.logScheduledTask(
          'AutoSafeBumpCheck',
          { 
            success: true,
            date: yesterdayStr,
            action: 'added_auto_safe_bump',
            duration: Date.now() - startTime
          },
          'end'
        );
        
        return {
          success: true,
          message: `Auto safe bump record added for ${yesterdayStr}`,
          date: yesterdayStr,
          action: 'added_auto_safe_bump'
        };
      } else {
        loggerHelper.logBusinessProcess(
          'AutoSafeBumpCheck',
          `昨天已存在碰记录，跳过自动安全签到`,
          { date: yesterdayStr, recordCount: existingRecords.length },
          'info'
        );
        
        loggerHelper.logScheduledTask(
          'AutoSafeBumpCheck',
          { 
            success: true,
            date: yesterdayStr,
            action: 'skipped_has_records',
            duration: Date.now() - startTime
          },
          'end'
        );
        
        return {
          success: true,
          message: `Bump records already exist for ${yesterdayStr}`,
          date: yesterdayStr,
          action: 'skipped_has_records'
        };
      }
    } catch (error) {
      loggerHelper.logError('自动安全碰检查失败', error, [
        '检查数据库连接是否正常',
        '确认时区设置是否正确（Asia/Shanghai）'
      ]);
      return {
        success: false,
        message: 'Auto safe bump check failed',
        error: error.message
      };
    }
  }

  // 手动触发自动签到
  static async triggerAutoCheckin() {
    return await this.autoSafeCheckin();
  }

  // 手动触发今天的自动"今日很乖"
  static async triggerAutoNoMilkteaToday() {
    return await this.autoNoMilkteaForToday();
  }

  // 手动触发今天的自动每日一碰平安卡
  static async triggerAutoSafeBumpToday() {
    return await this.autoSafeBumpForToday();
  }
}

module.exports = AutoCheckinService;
