module.exports = {
  apps: [
    {
      name: 'wu-chenfei-checkin-backend',
      script: './server.js',
      instances: 1, // 单实例模式（定时任务只需要一个实例）
      exec_mode: 'fork', // fork模式（非集群）
      autorestart: true, // 自动重启
      watch: false, // 不监听文件变化（生产环境）
      max_memory_restart: '500M', // 内存超过500M时自动重启
      env: {
        NODE_ENV: 'production',
        PORT: 20010
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 20010
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true, // 合并日志
      min_uptime: '10s', // 最小运行时间
      max_restarts: 10, // 最大重启次数
      restart_delay: 4000, // 重启延迟4秒
      kill_timeout: 5000, // 优雅关闭超时
      listen_timeout: 10000 // 监听超时
    }
  ]
};