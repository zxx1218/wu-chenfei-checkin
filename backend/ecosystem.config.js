module.exports = {
  apps: [
    {
      name: 'wu-chenfei-checkin-backend',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 20010
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 20010
      },
      // PM2 日志配置
      error_file: './logs/pm2-error-%DATE%.log',
      out_file: './logs/pm2-out-%DATE%.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      merge_logs: true,
      // 日志轮转（需要 pm2-logrotate 模块）
      // 如果不使用 pm2-logrotate，PM2 会按日期自动分割日志文件
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000
    }
  ]
};
