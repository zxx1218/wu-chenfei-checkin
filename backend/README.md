# wu-chenfei-checkin Backend Service

本项目是 wu-chenfei-checkin 应用的本地后端服务，使用 MySQL 替代原有的 Supabase 服务。

## 特性

- 使用 Express.js 构建 RESTful API
- MySQL 数据库存储数据
- 支持 bump 记录、doi 记录和奶茶记录
- 自动安全签到功能
- 完整的 CRUD 操作
- **PM2 集群模式部署** - 支持多进程、自动重启、负载均衡

## 目录结构

```
backend/
├── config/           # 数据库配置
├── models/           # 数据模型
├── routes/           # API 路由
├── services/         # 业务逻辑服务
├── utils/            # 工具函数
├── logs/             # PM2 日志文件（自动生成）
├── .env             # 环境变量配置
├── ecosystem.config.js  # PM2 配置文件
├── start.sh         # 启动脚本（集群模式）
├── stop.sh          # 停止脚本
├── restart.sh       # 重启脚本
├── init-db.js       # 数据库初始化脚本
├── server.js        # 主服务器文件
├── package.json     # 项目依赖
└── README.md        # 项目说明
```

## 快速开始

### 方式一：使用启动脚本（推荐）

```bash
cd backend
./start.sh
```

启动脚本会自动：
- ✅ 检查 Node.js 和 PM2 是否安装
- ✅ 自动安装缺失的依赖
- ✅ 创建日志目录
- ✅ 以集群模式启动服务（充分利用多核 CPU）
- ✅ 显示服务状态和常用命令

### 方式二：手动启动

#### 1. 安装依赖

```bash
cd backend
npm install
```

#### 2. 全局安装 PM2（如果未安装）

```bash
npm install -g pm2
```

#### 3. 配置环境变量

复制 `.env.example` 文件并修改相应配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的 MySQL 连接信息：

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=checkin_db
DB_PORT=3306
PORT=20010
NODE_ENV=production
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=checkin-videos
```

#### 4. 初始化数据库

```bash
npm run init-db
```

这将创建数据库和相应的数据表。

#### 5. 使用 PM2 启动服务

```bash
pm2 start ecosystem.config.js
```

## PM2 管理命令

### 查看服务状态

```bash
pm2 list
pm2 status
```

### 查看日志

```bash
# 实时查看日志
pm2 logs wu-chenfei-checkin-backend

# 查看指定行数
pm2 logs wu-chenfei-checkin-backend --lines 100

# 清空日志
pm2 flush
```

### 监控面板

```bash
pm2 monit
```

### 重启服务

```bash
# 使用脚本
./restart.sh

# 或使用 PM2 命令
pm2 restart wu-chenfei-checkin-backend
```

### 停止服务

```bash
# 使用脚本
./stop.sh

# 或使用 PM2 命令
pm2 stop wu-chenfei-checkin-backend
```

### 删除服务

```bash
pm2 delete wu-chenfei-checkin-backend
```

### 设置开机自启

```bash
# 生成启动脚本
pm2 startup

# 保存当前进程列表
pm2 save
```

执行后会显示一条命令，复制并运行该命令即可设置开机自启。

## PM2 集群模式说明

### 什么是集群模式？

集群模式会启动多个 Node.js 进程，充分利用服务器的所有 CPU 核心，提高并发处理能力。

### 配置说明

在 `ecosystem.config.js` 中：

- `instances: 'max'` - 自动根据 CPU 核心数创建进程
- `exec_mode: 'cluster'` - 启用集群模式
- `autorestart: true` - 进程崩溃时自动重启
- `max_memory_restart: '500M'` - 内存超过 500MB 时自动重启
- `merge_logs: true` - 合并所有进程的日志

### 优势

- 🚀 **高性能** - 充分利用多核 CPU
- 🔄 **高可用** - 进程崩溃自动重启
- ⚖️ **负载均衡** - 自动分配请求到不同进程
- 📊 **零停机重启** - 支持平滑重启

## API 接口

### Bump 记录

- `GET /api/bump-records` - 获取所有 bump 记录
- `POST /api/bump-records` - 创建新的 bump 记录
- `GET /api/bump-records/:id` - 获取特定 bump 记录
- `PUT /api/bump-records/:id` - 更新特定 bump 记录
- `DELETE /api/bump-records/:id` - 删除特定 bump 记录
- `GET /api/bump-records/date/:date` - 获取指定日期的 bump 记录

### DOI 记录

- `GET /api/doi-records` - 获取所有 doi 记录
- `POST /api/doi-records` - 创建新的 doi 记录
- `GET /api/doi-records/:id` - 获取特定 doi 记录
- `PUT /api/doi-records/:id` - 更新特定 doi 记录
- `DELETE /api/doi-records/:id` - 删除特定 doi 记录
- `GET /api/doi-records/date/:date` - 获取指定日期的 doi 记录

### 奶茶记录

- `GET /api/milktea-records` - 获取所有奶茶记录
- `POST /api/milktea-records` - 创建新的奶茶记录
- `GET /api/milktea-records/:id` - 获取特定奶茶记录
- `PUT /api/milktea-records/:id` - 更新特定奶茶记录
- `DELETE /api/milktea-records/:id` - 删除特定奶茶记录
- `GET /api/milktea-records/date/:date` - 获取指定日期的奶茶记录

## 数据库表结构

### bump_records 表
- id: VARCHAR(36) - 主键
- created_at: TIMESTAMP - 创建时间
- date: TEXT - 日期
- time: TEXT - 时间
- type: ENUM('bump', 'safe') - 类型
- location: TEXT - 位置
- severity: ENUM('超痛', '很痛', '一般痛', '不怎么痛') - 严重程度

### doi_records 表
- id: VARCHAR(36) - 主键
- created_at: TIMESTAMP - 创建时间
- date: TEXT - 日期
- time: TEXT - 时间
- duration_minutes: INT - 持续分钟数
- position: TEXT - 体位
- passion_score: INT - 激情分数
- notes: TEXT - 备注
- oral_sex: BOOLEAN - 口交
- female_orgasm: BOOLEAN - 女方高潮
- oral_explosion: BOOLEAN - 口爆
- ejaculation_method: TEXT - 射精方式
- scene: TEXT - 场景
- partner_overall_score: INT - 伴侣总体评分
- partner_passion_score: INT - 伴侣激情评分
- partner_duration_feedback: TEXT - 伴侣持续时间反馈
- partner_position_feedback: TEXT - 伴侣体位反馈
- partner_comment: TEXT - 伴侣评论
- partner_reviewer: TEXT - 伴侣评价者
- partner_reviewed_at: TIMESTAMP - 伴侣评价时间
- video_url: TEXT - 视频URL

### milktea_records 表
- id: VARCHAR(36) - 主键
- created_at: TIMESTAMP - 创建时间
- date: TEXT - 日期
- time: TEXT - 时间
- type: ENUM('milktea', 'no_milktea') - 类型
- brand: TEXT - 品牌
- drink_name: TEXT - 饮品名称
- image: LONGTEXT - 图片(base64格式)

## 日志管理

PM2 会将日志输出到 `logs/` 目录：

- `logs/out.log` - 标准输出日志
- `logs/error.log` - 错误日志

### 日志轮转（可选）

如果需要日志轮转功能，可以安装 pm2-logrotate：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 故障排查

### 服务无法启动

1. 检查端口是否被占用：
```bash
lsof -i :20010
```

2. 查看错误日志：
```bash
pm2 logs wu-chenfei-checkin-backend --err
cat logs/error.log
```

3. 检查数据库连接：
```bash
node test-db.js
```

### 内存占用过高

PM2 已配置自动重启（500MB 限制），也可以手动调整：

```bash
pm2 set wu-chenfei-checkin-backend max_memory_restart 1G
```

### 查看进程详情

```bash
pm2 show wu-chenfei-checkin-backend
```

## 开发模式

开发时可以使用 nodemon：

```bash
npm run dev
```

注意：开发模式不使用 PM2 集群模式。

## 部署建议

### 生产环境

1. 设置 `NODE_ENV=production`
2. 配置防火墙只开放必要端口
3. 使用 HTTPS（可通过 Nginx 反向代理）
4. 定期备份数据库
5. 监控服务器资源

### Nginx 反向代理配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:20010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 自动签到功能

系统包含自动安全签到功能，会在每天自动检查昨天是否有相关记录，如果没有则自动添加安全记录。

## 前端适配

要将前端从 Supabase 迁移到新的后端服务，需要替换 API 调用：

1. 修改前端的 API 请求地址
2. 将 Supabase 客户端调用替换为 HTTP 请求
3. 调整数据格式以匹配新的后端接口

## 许可证

ISC