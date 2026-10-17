const IncomePushConfig = require('../models/IncomePushConfig');
const PushHistory = require('../models/PushHistory');
const loggerHelper = require('../utils/loggerHelper');
const https = require('https');

function getDeviceKeyByTarget(target) {
  const keys = {
    zxx: process.env.VITE_BARK_KEY_ZXX || process.env.BARK_KEY_ZXX || '',
    '小菲': process.env.VITE_BARK_KEY_XIAOFEI || process.env.BARK_KEY_XIAOFEI || '',
  };
  return keys[target] || '';
}

function formatMoney(amount) {
  return Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

class IncomePushService {
  static SALARY_FIELDS = [
    { key: 'base_salary', label: '基本工资', icon: '💼', type: 'income' },
    { key: 'position_allowance', label: '岗位津贴', icon: '📋', type: 'income' },
    { key: 'performance', label: '绩效工资', icon: '🏆', type: 'income' },
    { key: 'overtime_pay', label: '加班费', icon: '⏰', type: 'income' },
    { key: 'bonus', label: '奖金', icon: '🎁', type: 'income' },
    { key: 'subsidy', label: '指尖饭卡补贴', icon: '📦', type: 'income' },
    { key: 'other_income', label: '其他收入', icon: '💎', type: 'income' },
    { key: 'pension_insurance', label: '养老保险', icon: '🧓', type: 'deduction' },
    { key: 'medical_insurance', label: '医疗保险', icon: '🏥', type: 'deduction' },
    { key: 'unemployment_insurance', label: '失业保险', icon: '🛡️', type: 'deduction' },
    { key: 'housing_fund', label: '公积金', icon: '🏠', type: 'deduction' },
    { key: 'enterprise_annuity', label: '企业年金', icon: '🏦', type: 'deduction' },
    { key: 'tax', label: '个税', icon: '💸', type: 'deduction' },
    { key: 'other_deduction', label: '其他扣款', icon: '📉', type: 'deduction' },
  ];

  static calcMonthlyNet(salaryDetails) {
    const details = salaryDetails || {};
    const income = this.SALARY_FIELDS
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + (Number(details[f.key]) || 0), 0);
    const deductions = this.SALARY_FIELDS
      .filter(f => f.type === 'deduction')
      .reduce((sum, f) => sum + (Number(details[f.key]) || 0), 0);
    return income - deductions;
  }

  static calcDailyWage(config) {
    const details = config.salary_details || {};
    const workingDays = Number(details.working_days) || 21.75;
    const monthlyNet = this.calcMonthlyNet(details);
    return monthlyNet / workingDays;
  }

  static generateDailySalaryMessage(config) {
    const { item_name, salary_details } = config;
    const details = salary_details || {};
    const workingDays = Number(details.working_days) || 21.75;
    const monthlyNet = this.calcMonthlyNet(details);
    const dailyWage = monthlyNet / workingDays;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[now.getDay()];

    const lines = [];
    lines.push(`💰 今日到手：¥${formatMoney(dailyWage)}`);
    lines.push(`📅 ${year}年${month}月${day}日 星期${weekDay}`);
    lines.push('');
    lines.push(`📊 月实发 ¥${formatMoney(monthlyNet)} ÷ ${workingDays}个工作日`);

    const incomeFields = this.SALARY_FIELDS.filter(f => f.type === 'income');
    const deductionFields = this.SALARY_FIELDS.filter(f => f.type === 'deduction');

    const hasDetails = this.SALARY_FIELDS.some(f => {
      const v = details[f.key];
      return v !== undefined && v !== null && Number(v) !== 0;
    });

    if (hasDetails) {
      lines.push('');
      lines.push('── 薪资明细 ──');

      const totalIncome = incomeFields.reduce((s, f) => s + (Number(details[f.key]) || 0), 0);
      const totalDeduction = deductionFields.reduce((s, f) => s + (Number(details[f.key]) || 0), 0);

      for (const field of incomeFields) {
        const val = details[field.key];
        if (val !== undefined && val !== null && Number(val) !== 0) {
          lines.push(`${field.icon} ${field.label}：¥${formatMoney(val)}`);
        }
      }
      if (totalIncome > 0) {
        lines.push(`  小计：¥${formatMoney(totalIncome)}`);
      }

      lines.push('');
      for (const field of deductionFields) {
        const val = details[field.key];
        if (val !== undefined && val !== null && Number(val) !== 0) {
          lines.push(`${field.icon} ${field.label}：-¥${formatMoney(Math.abs(Number(val)))}`);
        }
      }
      if (totalDeduction > 0) {
        lines.push(`  小计：-¥${formatMoney(totalDeduction)}`);
      }

      lines.push('');
      lines.push(`✅ 月到手：¥${formatMoney(monthlyNet)}`);
    }

    lines.push('');
    const messages = [
      '💪 辛苦啦，今天也是努力的一天！',
      '🌟 每一天的付出都值得~',
      '🎯 日积月累，未来可期！',
      '💕 认真赚钱的样子最酷~',
      '✨ 今天也是充实搬砖的一天！',
    ];
    lines.push(messages[Math.floor(Math.random() * messages.length)]);

    return lines.join('\n');
  }

  static generateIncomeMessage(config) {
    const { item_name, amount } = config;

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const lines = [];
    lines.push(`💰 今日收入`);
    lines.push(`📌 ${item_name || '收入'}`);
    lines.push(`📅 ${month}月${day}日`);
    lines.push(`💵 金额：¥${formatMoney(amount)}`);
    lines.push('');

    const messages = [
      '💪 赚钱小能手就是你！',
      '🎉 又入账一笔，开心~',
      '🌟 努力终有回报！',
      '💕 今天也是收获满满的一天~',
      '✨ 积少成多，未来可期！',
    ];
    lines.push(messages[Math.floor(Math.random() * messages.length)]);

    return lines.join('\n');
  }

  static generateMessage(config) {
    if (config.push_message && config.push_message.trim()) {
      const details = config.salary_details || {};
      const workingDays = Number(details.working_days) || 21.75;
      const monthlyNet = config.item_type === 'salary' ? this.calcMonthlyNet(details) : config.amount;
      const dailyWage = config.item_type === 'salary' ? monthlyNet / workingDays : config.amount;

      return config.push_message
        .replace(/{daily_wage}/g, formatMoney(dailyWage))
        .replace(/{monthly_net}/g, formatMoney(monthlyNet))
        .replace(/{working_days}/g, String(workingDays))
        .replace(/{amount}/g, formatMoney(dailyWage))
        .replace(/{item_name}/g, config.item_name || '收入');
    }

    if (config.item_type === 'salary') {
      return this.generateDailySalaryMessage(config);
    }
    return this.generateIncomeMessage(config);
  }

  static async pushIncomeMessage(config) {
    const startTime = Date.now();
    try {
      const { target } = config;
      const device_key = config.device_key || getDeviceKeyByTarget(target);

      if (!device_key) {
        loggerHelper.logError(`收入推送失败 - 未找到目标用户 ${target} 的设备Key`, new Error('Device key not found'));
        return false;
      }

      const message = this.generateMessage(config);
      const title = message.split('\n')[0];
      const body = message.split('\n').slice(1).join('\n');

      const barkUrl = process.env.VITE_BARK_PUSH_URL || 'https://api.day.app/push';
      const payload = {
        title,
        body,
        level: 'active',
        sound: 'cash_register',
        icon: 'https://picsum.photos/id/20/400/300',
        group: '收入提醒',
        url: process.env.VITE_BARK_JUMP_URL || 'http://cheerout.cn:40001',
        device_keys: [device_key],
      };

      loggerHelper.logBusinessProcess('IncomePush', `向${target}推送收入消息`, {
        target,
        itemType: config.item_type,
      });

      return new Promise((resolve) => {
        const postData = JSON.stringify(payload);
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(postData),
          },
        };

        const req = https.request(barkUrl, options, async (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', async () => {
            if (res.statusCode === 200) {
              loggerHelper.logPerformance('IncomePush_Success', Date.now() - startTime, { target });
              try {
                await PushHistory.create({
                  title, body, target, device_key,
                  sound: 'cash_register', status: 'success', push_type: 'income',
                });
              } catch (e) { loggerHelper.logError('记录收入推送历史失败', e); }
              resolve(true);
            } else {
              loggerHelper.logError(`Bark API返回错误: ${res.statusCode}`, new Error(data));
              try {
                await PushHistory.create({
                  title, body, target, device_key,
                  sound: 'cash_register', status: 'failed', push_type: 'income',
                });
              } catch (e) { loggerHelper.logError('记录收入推送历史失败', e); }
              resolve(false);
            }
          });
        });

        req.on('error', async (error) => {
          loggerHelper.logError('收入推送请求失败', error);
          try {
            await PushHistory.create({
              title, body, target, device_key,
              sound: 'cash_register', status: 'failed', push_type: 'income',
            });
          } catch (e) { loggerHelper.logError('记录收入推送历史失败', e); }
          resolve(false);
        });

        req.write(postData);
        req.end();
      });
    } catch (error) {
      loggerHelper.logError('推送收入消息异常', error);
      return false;
    }
  }

  static async executeDailyPush() {
    const startTime = Date.now();
    try {
      const subscriptions = await IncomePushConfig.findEnabled();
      const now = new Date();
      const today = now.getDate();
      const dayOfWeek = now.getDay() || 7;

      const dueConfigs = subscriptions.filter(sub => {
        if (sub.item_type === 'salary') return true;
        const freq = sub.push_frequency || 'daily';
        if (freq === 'daily') return true;
        if (freq === 'weekly') return sub.push_day === dayOfWeek;
        if (freq === 'monthly') return sub.push_day === today;
        return true;
      });

      if (dueConfigs.length === 0) {
        return { success: true, message: 'No income push due today' };
      }

      const results = [];
      for (const config of dueConfigs) {
        const success = await this.pushIncomeMessage(config);
        results.push({ target: config.target, itemName: config.item_name, success });
      }

      loggerHelper.logScheduledTask('IncomePush', {
        success: true,
        total: dueConfigs.length,
        results,
        duration: Date.now() - startTime,
      }, 'end');

      return { success: true, results };
    } catch (error) {
      loggerHelper.logError('收入推送任务执行失败', error);
      return { success: false, error: error.message };
    }
  }

  static async triggerPush(configId) {
    try {
      const config = await IncomePushConfig.findById(configId);
      if (!config) return { success: false, message: '配置未找到' };

      const success = await this.pushIncomeMessage(config);
      return { success, message: success ? '推送成功' : '推送失败' };
    } catch (error) {
      loggerHelper.logError('手动触发收入推送失败', error);
      return { success: false, error: error.message };
    }
  }

  static previewMessage(config) {
    try {
      const message = this.generateMessage(config);
      const lines = message.split('\n');
      return {
        title: lines[0],
        body: lines.slice(1).join('\n'),
        fullText: message,
      };
    } catch (error) {
      return { title: '', body: '', error: error.message };
    }
  }
}

module.exports = IncomePushService;
