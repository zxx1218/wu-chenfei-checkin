const path = require('path');
// 统一使用根目录下的.env文件
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { initializeBucket } = require('./config/minio');
const AutoCheckinService = require('./services/autoCheckinService');
const loggerHelper = require('./utils/loggerHelper');

// 导入路由
const bumpRecordsRouter = require('./routes/bumpRecords');
const doiRecordsRouter = require('./routes/doiRecords');
const milkteaRecordsRouter = require('./routes/milkteaRecords');
const userSettingsRouter = require('./routes/userSettings');
const pushHistoryRouter = require('./routes/pushHistory');
const weatherPushSubscriptionRouter = require('./routes/weatherPushSubscription');

const app = express();
const PORT = process.env.PORT || 20010;

// 初始化MinIO存储桶
initializeBucket()
  .then(() => {
    loggerHelper.logBusinessProcess(
      'MinIO',
      '初始化成功',
      {},
      'info'
    );
  })
  .catch((err) => {
    loggerHelper.logError('MinIO初始化失败', err, [
      '检查MinIO服务是否正常运行',
      '验证环境变量配置（MINIO_ENDPOINT、MINIO_ACCESS_KEY等）',
      '确认网络连接权限是否正确'
    ]);
  });

// 设置定时任务：每天0:01自动检查前一天是否有奶茶记录，如果没有则自动打"今日很乖"
cron.schedule('1 0 * * *', async () => {
  loggerHelper.logScheduledTask('AutoNoMilkteaCheckin', {}, 'start');
  const result = await AutoCheckinService.autoNoMilkteaForToday();
  loggerHelper.logScheduledTask('AutoNoMilkteaCheckin', result, 'end');
}, {
  timezone: 'Asia/Shanghai'
});

loggerHelper.logBusinessProcess(
  'CronJob',
  '注册定时任务',
  { 
    task: 'auto-no-milktea-checkin',
    schedule: '1 0 * * *',
    timezone: 'Asia/Shanghai',
    description: '每天0:01自动检查前一天奶茶记录'
  },
  'info'
);

// 设置定时任务：每天0:01自动检查前一天是否有每日一碰记录，如果没有则自动打平安卡
cron.schedule('1 0 * * *', async () => {
  loggerHelper.logScheduledTask('AutoSafeBumpCheckin', {}, 'start');
  const result = await AutoCheckinService.autoSafeBumpForToday();
  loggerHelper.logScheduledTask('AutoSafeBumpCheckin', result, 'end');
}, {
  timezone: 'Asia/Shanghai'
});

loggerHelper.logBusinessProcess(
  'CronJob',
  '注册定时任务',
  { 
    task: 'auto-safe-bump-checkin',
    schedule: '1 0 * * *',
    timezone: 'Asia/Shanghai',
    description: '每天0:01自动检查前一天碰记录'
  },
  'info'
);

// 动态设置定时推送任务（根据订阅配置）
async function setupScheduledPushSchedule() {
  try {
    const WeatherPushSubscription = require('./models/WeatherPushSubscription');
    const subscriptions = await WeatherPushSubscription.findEnabled();
    
    if (subscriptions.length > 0) {
      // 获取所有不同的推送时间
      const pushTimes = [...new Set(subscriptions.map(s => s.push_time))];
      
      pushTimes.forEach(pushTime => {
        const [hour, minute] = pushTime.split(':').map(Number);
        const cronExpression = `${minute} ${hour} * * *`;
        
        cron.schedule(cronExpression, async () => {
          loggerHelper.logScheduledTask(`WeatherPush_${pushTime}`, {}, 'start');
          const WeatherPushService = require('./services/weatherPushService');
          const result = await WeatherPushService.executeDailyPush();
          loggerHelper.logScheduledTask(`WeatherPush_${pushTime}`, result, 'end');
        }, {
          timezone: 'Asia/Shanghai'
        });
        
        loggerHelper.logBusinessProcess(
          'CronJob',
          '注册天气推送定时任务',
          { 
            pushTime,
            cronExpression,
            timezone: 'Asia/Shanghai'
          },
          'info'
        );
      });
    } else {
      loggerHelper.logBusinessProcess(
        'CronJob',
        '跳过天气推送定时任务注册',
        { reason: '无启用的订阅' },
        'info'
      );
    }
  } catch (error) {
    loggerHelper.logError('设置定时推送任务失败', error);
  }
}

// 启动时设置定时推送任务
setupScheduledPushSchedule();

// CORS配置 - 修复安全问题
const corsOptions = {
  origin: function (origin, callback) {
    // 在生产环境中，明确指定允许的源
    // 对于开发环境，允许localhost和本地IP
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') || 
        origin.includes('::1') ||
        origin.includes('cheerout.cn')) {
      callback(null, true);
    } else {
      loggerHelper.logBusinessProcess(
        'CORS',
        '拒绝跨域请求',
        { origin },
        'warn'
      );
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// 请求日志中间件（在路由之前注册）
app.use(requestLogger);

// 解析JSON请求体 - 增加限制以支持大文件上传
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// API路由
app.use('/api/bump-records', bumpRecordsRouter);
app.use('/api/doi-records', doiRecordsRouter);
app.use('/api/milktea-records', milkteaRecordsRouter);
app.use('/api/user-settings', userSettingsRouter);
app.use('/api/push-history', pushHistoryRouter);
app.use('/api/weather-push-subscription', weatherPushSubscriptionRouter);

// 根路径
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to wu-chenfei-checkin backend API!' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  loggerHelper.logError('未处理的服务器错误', err, [
    '检查路由处理器是否正确',
    '验证数据库操作是否正常',
    '查看完整的错误堆栈信息'
  ]);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404处理
app.use('*', (req, res) => {
  loggerHelper.logBusinessProcess(
    'Router',
    '路由未找到',
    { 
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    },
    'warn'
  );
  res.status(404).json({ error: 'Route not found' });
});

// 临时调试端点：检查环境变量（仅在开发环境启用）
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/env', (req, res) => {
    res.json({
      VITE_BARK_KEY_ZXX: process.env.VITE_BARK_KEY_ZXX ? `${process.env.VITE_BARK_KEY_ZXX.substring(0, 5)}...` : '未设置',
      VITE_BARK_KEY_XIAOFEI: process.env.VITE_BARK_KEY_XIAOFEI ? `${process.env.VITE_BARK_KEY_XIAOFEI.substring(0, 5)}...` : '未设置',
      NODE_ENV: process.env.NODE_ENV || 'development'
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  loggerHelper.logBusinessProcess(
    'Server',
    '服务器启动成功',
    { 
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      host: '0.0.0.0'
    },
    'info'
  );
});

module.exports = app;
