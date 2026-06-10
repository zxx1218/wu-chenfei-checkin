# wu-chenfei-checkin Backend Service

本项目是 wu-chenfei-checkin 应用的本地后端服务，使用 MySQL 替代原有的 Supabase 服务。

## 特性

- 使用 Express.js 构建 RESTful API
- MySQL 数据库存储数据
- 支持 bump 记录、doi 记录和奶茶记录
- 自动安全签到功能
- 完整的 CRUD 操作

## 目录结构

```
backend/
├── config/           # 数据库配置
├── models/           # 数据模型
├── routes/           # API 路由
├── services/         # 业务逻辑服务
├── utils/            # 工具函数
├── .env             # 环境变量配置
├── init-db.js       # 数据库初始化脚本
├── server.js        # 主服务器文件
├── package.json     # 项目依赖
└── README.md        # 项目说明
```

## 安装与启动

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

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
PORT=3001
NODE_ENV=development
```

### 3. 初始化数据库

```bash
npm run init-db
```

这将创建数据库和相应的数据表。

### 4. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将在 `http://localhost:3001` 上运行。

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

### milktea_records 表
- id: VARCHAR(36) - 主键
- created_at: TIMESTAMP - 创建时间
- date: TEXT - 日期
- time: TEXT - 时间
- type: ENUM('milktea', 'no_milktea') - 类型
- brand: TEXT - 品牌
- drink_name: TEXT - 饮品名称

## 自动签到功能

系统包含自动安全签到功能，会在每天自动检查昨天是否有相关记录，如果没有则自动添加安全记录。

## 前端适配

要将前端从 Supabase 迁移到新的后端服务，需要替换 API 调用：

1. 修改前端的 API 请求地址
2. 将 Supabase 客户端调用替换为 HTTP 请求
3. 调整数据格式以匹配新的后端接口

## 开发

使用 nodemon 进行开发：

```bash
npm run dev
```

## 部署

在生产环境中运行：

```bash
npm start
```

确保在生产环境中设置了适当的环境变量。