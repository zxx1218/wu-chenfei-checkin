#!/bin/bash

# ============================================
# wu-chenfei-checkin 后端服务重启脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}正在重启 wu-chenfei-checkin 后端服务...${NC}"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}错误: PM2 未安装${NC}"
    exit 1
fi

# 重启服务
pm2 restart wu-chenfei-checkin-backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  服务重启成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # 等待2秒让服务完全启动
    sleep 2
    
    # 显示服务状态
    echo -e "${YELLOW}服务状态:${NC}"
    pm2 list
else
    echo -e "${RED}服务重启失败，尝试重新启动...${NC}"
    ./start.sh
fi
