const minio = require('minio');
const loggerHelper = require('../utils/loggerHelper');

const minioClient = new minio.Client({
  endPoint: process.env.MINIO_ENDPOINT?.split(':')[0] || 'cheerout.cn',
  port: parseInt(process.env.MINIO_ENDPOINT?.split(':')[1]) || 19000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'zxx',
  secretKey: process.env.MINIO_SECRET_KEY || '991218aa'
});

const bucketName = process.env.MINIO_BUCKET || 'editmydegree';

// 验证存储桶名称是否符合 MinIO/DNS 命名规范
function validateBucketName(name) {
  // MinIO 存储桶名称必须符合 DNS 命名规则：
  // - 只能包含小写字母、数字和连字符(-)
  // - 必须以字母或数字开头和结尾
  // - 长度在 3-63 个字符之间
  const bucketNameRegex = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
  
  if (!name || typeof name !== 'string') {
    return { valid: false, error: '存储桶名称不能为空' };
  }
  
  if (name.length < 3 || name.length > 63) {
    return { valid: false, error: `存储桶名称长度必须在 3-63 个字符之间，当前长度: ${name.length}` };
  }
  
  if (!bucketNameRegex.test(name)) {
    return { 
      valid: false, 
      error: `存储桶名称 "${name}" 不符合规范。只能包含小写字母、数字、连字符(-)和点(.)，且必须以字母或数字开头和结尾` 
    };
  }
  
  return { valid: true };
}

// 检查存储桶是否存在，如果不存在则创建
async function initializeBucket() {
  try {
    const validation = validateBucketName(bucketName);
    if (!validation.valid) {
      loggerHelper.logError('存储桶名称验证失败', new Error(validation.error), [
        '检查 .env 文件中的 MINIO_BUCKET 配置项',
        '存储桶名称只能包含小写字母、数字、连字符(-)和点(.)',
        '必须以字母或数字开头和结尾，长度在 3-63 个字符之间'
      ]);
      throw new Error(validation.error);
    }
    
    loggerHelper.logBusinessProcess('MinIO', '检查存储桶', { bucket: bucketName });
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      loggerHelper.logBusinessProcess('MinIO', '存储桶不存在，正在创建', { bucket: bucketName });
      await minioClient.makeBucket(bucketName);
      loggerHelper.logBusinessProcess('MinIO', '存储桶创建成功', { bucket: bucketName });
    } else {
      loggerHelper.logBusinessProcess('MinIO', '存储桶已存在', { bucket: bucketName });
    }
  } catch (err) {
    loggerHelper.logError('初始化存储桶失败', err, [
      '检查 MinIO 服务是否正常运行',
      '验证 accessKey 和 secretKey 是否正确',
      '确认 endPoint 和端口配置正确',
      `当前存储桶名称: "${bucketName}"`
    ]);
    throw err;
  }
}

module.exports = {
  minioClient,
  bucketName,
  initializeBucket
};
