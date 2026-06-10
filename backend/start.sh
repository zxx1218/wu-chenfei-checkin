#!/bin/bash

# ============================================
# wu-chenfei-checkin 后端服务启动脚本
# 使用 PM2 集群模式启动
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  wu-chenfei-checkin 后端服务启动${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否在项目根目录
if [ ! -f "$PROJECT_DIR/server.js" ]; then
    echo -e "${RED}错误: 请在后端项目根目录下运行此脚本${NC}"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

echo -e "${YELLOW}Node.js 版本: $(node -v)${NC}"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 未安装，正在全局安装...${NC}"
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: PM2 安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}PM2 安装成功${NC}"
fi

echo -e "${YELLOW}PM2 版本: $(pm2 -v)${NC}"

# 检查依赖是否安装
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${YELLOW}检测到未安装依赖，正在安装...${NC}"
    cd "$PROJECT_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 依赖安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}依赖安装完成${NC}"
fi

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"

# 检查 .env 文件
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}警告: .env 文件不存在${NC}"
    echo -e "${YELLOW}请确保已配置环境变量${NC}"
fi

# 停止已存在的服务（如果存在）
echo -e "${YELLOW}检查现有服务...${NC}"
pm2 list | grep -q "wu-chenfei-checkin-backend"
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}发现运行中的服务，正在停止...${NC}"
    pm2 stop wu-chenfei-checkin-backend
    pm2 delete wu-chenfei-checkin-backend
fi

# 启动服务
echo -e "${GREEN}正在启动服务（集群模式）...${NC}"
cd "$PROJECT_DIR"
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  服务启动成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # 等待2秒让服务完全启动
    sleep 2
    
    # 显示服务状态
    echo -e "${YELLOW}服务状态:${NC}"
    pm2 list
    
    echo ""
    echo -e "${YELLOW}常用命令:${NC}"
    echo -e "  查看日志:     ${GREEN}pm2 logs wu-chenfei-checkin-backend${NC}"
    echo -e "  查看状态:     ${GREEN}pm2 status${NC}"
    echo -e "  重启服务:     ${GREEN}pm2 restart wu-chenfei-checkin-backend${NC}"
    echo -e "  停止服务:     ${GREEN}pm2 stop wu-chenfei-checkin-backend${NC}"
    echo -e "  删除服务:     ${GREEN}pm2 delete wu-chenfei-checkin-backend${NC}"
    echo -e "  监控面板:     ${GREEN}pm2 monit${NC}"
    echo ""
    echo -e "${YELLOW}设置开机自启:${NC}"
    echo -e "  ${GREEN}pm2 startup${NC}"
    echo -e "  ${GREEN}pm2 save${NC}"
    echo ""
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  服务启动失败！${NC}"
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}请检查日志文件: $PROJECT_DIR/logs/error.log${NC}"
    exit 1
fi
