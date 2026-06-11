require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { initializeBucket } = require('./config/minio');
const AutoCheckinService = require('./services/autoCheckinService');

// 导入路由
const bumpRecordsRouter = require('./routes/bumpRecords');
const doiRecordsRouter = require('./routes/doiRecords');
const milkteaRecordsRouter = require('./routes/milkteaRecords');
const userSettingsRouter = require('./routes/userSettings');

const app = express();
const PORT = process.env.PORT || 20010;

// 初始化MinIO存储桶
initializeBucket()
  .then(() => {
    console.log('MinIO初始化成功');
  })
  .catch((err) => {
    console.error('MinIO初始化失败:', err);
  });

// 设置定时任务：每天0:01自动检查前一天是否有奶茶记录，如果没有则自动打"今日很乖"
cron.schedule('1 0 * * *', async () => {
  console.log('Running scheduled auto no-milktea check-in for yesterday...');
  const result = await AutoCheckinService.autoNoMilkteaForToday();
  console.log('Scheduled task result:', result);
}, {
  timezone: 'Asia/Shanghai'
});

console.log('Scheduled auto no-milktea check-in at 00:01 every day for yesterday (Asia/Shanghai)');

// 设置定时任务：每天0:01自动检查前一天是否有每日一碰记录，如果没有则自动打平安卡
cron.schedule('1 0 * * *', async () => {
  console.log('Running scheduled auto safe bump check-in for yesterday...');
  const result = await AutoCheckinService.autoSafeBumpForToday();
  console.log('Scheduled task result:', result);
}, {
  timezone: 'Asia/Shanghai'
});

console.log('Scheduled auto safe bump check-in at 00:01 every day for yesterday (Asia/Shanghai)');

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
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// 解析JSON请求体 - 增加限制以支持大文件上传
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// API路由
app.use('/api/bump-records', bumpRecordsRouter);
app.use('/api/doi-records', doiRecordsRouter);
app.use('/api/milktea-records', milkteaRecordsRouter);
app.use('/api/user-settings', userSettingsRouter);

// 根路径
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to wu-chenfei-checkin backend API!' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;