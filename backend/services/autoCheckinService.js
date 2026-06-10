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

  // 手动触发自动签到
  static async triggerAutoCheckin() {
    return await this.autoSafeCheckin();
  }
}

module.exports = AutoCheckinService;