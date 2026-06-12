#!/usr/bin/env node

const Minio = require('minio');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

// ==================== 配置 ====================
const config = {
  endPoint: 'cheerout.cn',
  port: 19000,
  useSSL: false,
  accessKey: 'zxx',
  secretKey: '991218aa',
  bucket: 'wcf-doi-video',
};

// 从命令行参数获取本地保存目录，默认为 ./download
const localDir = process.argv[2] || './download';
// =============================================

const minioClient = new Minio.Client(config);

async function ensureDir(dirPath) {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function downloadBucket() {
  console.log(`🔍 正在列出存储桶 "${config.bucket}" 中的所有对象...`);

  const objectsStream = minioClient.listObjectsV2(config.bucket, '', true);
  const objects = [];

  // 收集所有对象
  for await (const obj of objectsStream) {
    objects.push(obj);
  }

  if (objects.length === 0) {
    console.log('ℹ️  存储桶为空，没有文件需要下载。');
    return;
  }

  console.log(`📦 共发现 ${objects.length} 个对象，开始下载...\n`);

  // 创建根目录
  await ensureDir(localDir);

  let downloaded = 0;
  let failed = 0;

  // 顺序下载（可改为并发池控制）
  for (const obj of objects) {
    // 跳过以 '/' 结尾的“目录”对象（MinIO 可能返回虚拟目录）
    if (obj.name.endsWith('/')) continue;

    const filePath = path.join(localDir, obj.name);
    const fileDir = path.dirname(filePath);

    try {
      await ensureDir(fileDir);

      // 下载文件
      await minioClient.fGetObject(config.bucket, obj.name, filePath);
      downloaded++;
      console.log(`✅ [${downloaded}/${objects.length}] ${obj.name} → ${filePath}`);
    } catch (err) {
      failed++;
      console.error(`❌ 下载失败: ${obj.name}`, err.message);
    }
  }

  console.log(`\n🎉 下载完成：成功 ${downloaded} 个，失败 ${failed} 个，总计 ${objects.length} 个对象。`);
}

downloadBucket().catch((err) => {
  console.error('💥 脚本执行出错:', err);
  process.exit(1);
});