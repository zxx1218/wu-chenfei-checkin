#!/bin/bash

# ============================================
# wu-chenfei-checkin 后端服务停止脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}正在停止 wu-chenfei-checkin 后端服务...${NC}"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}错误: PM2 未安装${NC}"
    exit 1
fi

# 停止服务
pm2 stop wu-chenfei-checkin-backend 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}服务已停止${NC}"
else
    echo -e "${YELLOW}服务未在运行${NC}"
fi

# 可选：删除服务（取消注释以启用）
# pm2 delete wu-chenfei-checkin-backend
# echo -e "${GREEN}服务已从 PM2 中删除${NC}"

echo -e "${YELLOW}查看服务状态:${NC}"
pm2 list
