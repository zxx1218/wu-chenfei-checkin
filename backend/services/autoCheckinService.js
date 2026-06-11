const BumpRecord = require('../models/BumpRecord');
const MilkteaRecord = require('../models/MilkteaRecord');
const { v4: uuidv4 } = require('uuid');

class AutoCheckinService {
  // 获取昨天的日期字符串（中文格式）
  static getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // 获取今天的日期字符串（中文格式）
  static getTodayDateString() {
    const today = new Date();
    return today.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // 自动为昨天添加安全签到记录
  static async autoSafeCheckin() {
    try {
      const yesterdayStr = this.getYesterdayDateString();
      console.log(`Checking records for: ${yesterdayStr}`);

      // 检查昨天是否已有bump记录
      const bumpRecords = await BumpRecord.findByDate(yesterdayStr);
      
      if (!bumpRecords || bumpRecords.length === 0) {
        console.log(`No bump records for ${yesterdayStr}, adding auto safe record`);
        
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        await BumpRecord.create({
          date: yesterdayStr,
          time: time,
          type: 'safe',
          location: null,
          severity: null
        });
      } else {
        console.log(`Bump records exist for ${yesterdayStr}, skipping auto safe check-in`);
      }

      // 检查昨天是否已有奶茶记录
      const milkteaRecords = await MilkteaRecord.findByDate(yesterdayStr);
      
      if (!milkteaRecords || milkteaRecords.length === 0) {
        console.log(`No milktea records for ${yesterdayStr}, adding auto no_milktea record`);
        
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        await MilkteaRecord.create({
          date: yesterdayStr,
          time: time,
          type: 'no_milktea',
          brand: null,
          drink_name: null
        });
      } else {
        console.log(`Milktea records exist for ${yesterdayStr}, skipping auto no_milktea check-in`);
      }

      return {
        success: true,
        message: `Auto check-in completed for ${yesterdayStr}`,
        date: yesterdayStr
      };
    } catch (error) {
      console.error('Error in auto check-in:', error);
      return {
        success: false,
        message: 'Auto check-in failed',
        error: error.message
      };
    }
  }

  // 每天0:01自动给未打卡的人打"今日很乖"
  static async autoNoMilkteaForToday() {
    try {
      const yesterdayStr = this.getYesterdayDateString();
      console.log(`Auto no-milktea check for yesterday: ${yesterdayStr}`);

      const drinkers = ['小菲', 'zxx'];
      const results = [];

      for (const drinker of drinkers) {
        // 检查这个人昨天是否已有任何记录
        const existingRecords = await MilkteaRecord.findByDate(yesterdayStr);
        const personRecords = existingRecords.filter(r => r.drinker === drinker);

        if (personRecords.length === 0) {
          console.log(`${drinker} has no records for yesterday (${yesterdayStr}), adding auto no_milktea record`);
          
          const now = new Date();
          const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
          
          await MilkteaRecord.create({
            date: yesterdayStr,
            time: time,
            type: 'no_milktea',
            brand: null,
            drink_name: null,
            drinker: drinker
          });
          
          results.push({
            drinker,
            action: 'added_auto_no_milktea',
            success: true
          });
        } else {
          console.log(`${drinker} already has records for yesterday (${yesterdayStr}), skipping`);
          results.push({
            drinker,
            action: 'skipped_has_records',
            success: true
          });
        }
      }

      return {
        success: true,
        message: `Auto no-milktea check completed for ${yesterdayStr}`,
        date: yesterdayStr,
        results
      };
    } catch (error) {
      console.error('Error in auto no-milktea for yesterday:', error);
      return {
        success: false,
        message: 'Auto no-milktea check failed',
        error: error.message
      };
    }
  }

  // 每天0:01自动给未打卡的每日一碰打平安卡
  static async autoSafeBumpForToday() {
    try {
      const yesterdayStr = this.getYesterdayDateString();
      console.log(`Auto safe bump check for yesterday: ${yesterdayStr}`);

      // 检查昨天是否已有bump记录
      const existingRecords = await BumpRecord.findByDate(yesterdayStr);

      if (!existingRecords || existingRecords.length === 0) {
        console.log(`No bump records for yesterday (${yesterdayStr}), adding auto safe record`);
        
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        await BumpRecord.create({
          date: yesterdayStr,
          time: time,
          type: 'safe',
          location: null,
          severity: null
        });
        
        return {
          success: true,
          message: `Auto safe bump record added for ${yesterdayStr}`,
          date: yesterdayStr,
          action: 'added_auto_safe_bump'
        };
      } else {
        console.log(`Bump records exist for yesterday (${yesterdayStr}), skipping auto safe check-in`);
        return {
          success: true,
          message: `Bump records already exist for ${yesterdayStr}`,
          date: yesterdayStr,
          action: 'skipped_has_records'
        };
      }
    } catch (error) {
      console.error('Error in auto safe bump for yesterday:', error);
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