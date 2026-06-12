const BumpRecord = require('../models/BumpRecord');
const MilkteaRecord = require('../models/MilkteaRecord');
const { v4: uuidv4 } = require('uuid');

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
      console.log(`=== Auto no-milktea check START ===`);
      console.log(`Target date (yesterday): ${yesterdayStr}`);
      console.log(`Current server time: ${new Date().toISOString()}`);
      console.log(`Current Shanghai time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })}`);

      const drinkers = ['小菲', 'zxx'];
      const results = [];

      for (const drinker of drinkers) {
        console.log(`\n--- Checking drinker: ${drinker} ---`);
        
        // 检查这个人昨天是否已有任何记录
        const existingRecords = await MilkteaRecord.findByDate(yesterdayStr);
        console.log(`Total records for ${yesterdayStr}: ${existingRecords.length}`);
        if (existingRecords.length > 0) {
          console.log(`Records details:`, JSON.stringify(existingRecords.map(r => ({
            id: r.id,
            type: r.type,
            drinker: r.drinker,
            date: r.date
          })), null, 2));
        }
        
        const personRecords = existingRecords.filter(r => r.drinker === drinker);
        console.log(`Records for ${drinker}: ${personRecords.length}`);

        if (personRecords.length === 0) {
          console.log(`${drinker} has no records for yesterday (${yesterdayStr}), adding auto no_milktea record`);
          
          const now = new Date();
          const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' });
          
          await MilkteaRecord.create({
            date: yesterdayStr,
            time: time,
            type: 'no_milktea',
            brand: null,
            drink_name: null,
            drinker: drinker
          });
          
          console.log(`✓ Successfully added auto no_milktea record for ${drinker}`);
          
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

      console.log(`\n=== Auto no-milktea check END ===`);
      console.log(`Results:`, JSON.stringify(results, null, 2));

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
      console.log(`=== Auto safe bump check START ===`);
      console.log(`Target date (yesterday): ${yesterdayStr}`);
      console.log(`Current server time: ${new Date().toISOString()}`);
      console.log(`Current Shanghai time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })}`);

      // 检查昨天是否已有bump记录
      const existingRecords = await BumpRecord.findByDate(yesterdayStr);
      console.log(`Total bump records for ${yesterdayStr}: ${existingRecords ? existingRecords.length : 0}`);

      if (!existingRecords || existingRecords.length === 0) {
        console.log(`No bump records for yesterday (${yesterdayStr}), adding auto safe record`);
        
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' });
        
        await BumpRecord.create({
          date: yesterdayStr,
          time: time,
          type: 'safe',
          location: null,
          severity: null
        });
        
        console.log(`✓ Successfully added auto safe bump record for ${yesterdayStr}`);
        console.log(`=== Auto safe bump check END ===`);
        
        return {
          success: true,
          message: `Auto safe bump record added for ${yesterdayStr}`,
          date: yesterdayStr,
          action: 'added_auto_safe_bump'
        };
      } else {
        console.log(`Bump records exist for yesterday (${yesterdayStr}), skipping auto safe check-in`);
        console.log(`=== Auto safe bump check END ===`);
        
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