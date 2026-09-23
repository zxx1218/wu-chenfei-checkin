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
// 最大重试次数
const MAX_RETRIES = 3;
// =============================================

const minioClient = new Minio.Client({
  ...config,
  // 设置超时时间（毫秒）
  requestTimeout: 300000, // 5分钟
});

async function ensureDir(dirPath) {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * 检查文件是否已存在且完整
 */
async function isFileComplete(filePath, expectedSize) {
  try {
    const stats = await fsp.stat(filePath);
    return stats.size === expectedSize;
  } catch (err) {
    // 文件不存在或无法访问
    return false;
  }
}

/**
 * 带重试机制的下载函数
 */
async function downloadWithRetry(bucket, objectName, filePath, fileSize) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 检查是否为增量下载（文件已存在且完整）
      if (await isFileComplete(filePath, fileSize)) {
        return { status: 'skipped', reason: 'already_exists' };
      }

      // 如果文件存在但不完整，删除后重新下载
      try {
        await fsp.unlink(filePath);
      } catch (err) {
        // 忽略删除失败的错误
      }

      // 下载文件
      await minioClient.fGetObject(bucket, objectName, filePath);
      
      // 验证下载后的文件大小
      if (await isFileComplete(filePath, fileSize)) {
        return { status: 'success' };
      } else {
        throw new Error('文件大小不匹配');
      }
    } catch (err) {
      lastError = err;
      console.warn(`⚠️  尝试 ${attempt}/${MAX_RETRIES} 失败: ${objectName} - ${err.message}`);
      
      // 如果不是最后一次尝试，等待一段时间后重试
      if (attempt < MAX_RETRIES) {
        const waitTime = Math.pow(2, attempt) * 1000; // 指数退避：2s, 4s, 8s
        console.log(`⏳ 等待 ${waitTime/1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
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

  console.log(`📦 共发现 ${objects.length} 个对象\n`);

  // 创建根目录
  await ensureDir(localDir);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  // 顺序下载（可改为并发池控制）
  for (const obj of objects) {
    // 跳过以 '/' 结尾的"目录"对象（MinIO 可能返回虚拟目录）
    if (obj.name.endsWith('/')) continue;

    const filePath = path.join(localDir, obj.name);
    const fileDir = path.dirname(filePath);

    try {
      await ensureDir(fileDir);

      // 带重试机制的增量下载
      const result = await downloadWithRetry(config.bucket, obj.name, filePath, obj.size);
      
      if (result.status === 'skipped') {
        skipped++;
        console.log(`⏭️  [${downloaded + skipped + failed}/${objects.length}] 跳过 (已存在): ${obj.name}`);
      } else if (result.status === 'success') {
        downloaded++;
        const sizeMB = (obj.size / 1024 / 1024).toFixed(2);
        console.log(`✅ [${downloaded + skipped + failed}/${objects.length}] ${obj.name} (${sizeMB} MB)`);
      }
    } catch (err) {
      failed++;
      console.error(`❌ 下载失败: ${obj.name}`);
      console.error(`   错误信息: ${err.message}`);
    }
  }

  console.log(`\n🎉 下载完成统计：`);
  console.log(`   ✅ 新下载: ${downloaded} 个`);
  console.log(`   ⏭️  已跳过: ${skipped} 个 (增量下载)`);
  console.log(`   ❌ 失  败: ${failed} 个`);
  console.log(`   📊 总  计: ${objects.length} 个对象`);
}

downloadBucket().catch((err) => {
  console.error('💥 脚本执行出错:', err);
  process.exit(1);
});
