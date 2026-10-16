const multer = require('multer');
const { minioClient, bucketName } = require('../config/minio');
const path = require('path');
const fs = require('fs');
const loggerHelper = require('../utils/loggerHelper');

const TEMP_DIR = path.join(__dirname, '..', 'uploads', 'temp');

// 确保临时目录存在
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// 磁盘存储：先写入临时目录，上传MinIO后删除
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TEMP_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `upload-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传视频文件'));
    }
  },
});

// 上传视频到MinIO（使用文件流，不占内存）
async function uploadVideoToMinio(filePath, originalName, mimeType, recordData) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  // 生成MinIO文件名
  const dateStr = recordData.date
    ? recordData.date.replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = recordData.time ? recordData.time.replace(/:/g, '') : '';
  const ext = path.extname(originalName) || '.mp4';
  const timestamp = Date.now();
  const rawName = timeStr
    ? `${dateStr}_${timeStr}_${timestamp}${ext}`
    : `${dateStr}_${timestamp}${ext}`;
  const cleanFileName = rawName.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_').replace(/_{2,}/g, '_');

  loggerHelper.logBusinessProcess('VideoUpload', '开始上传视频到MinIO', {
    fileName: cleanFileName,
    size: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
    mimeType,
    bucket: bucketName,
  });

  // 使用文件流上传到MinIO，避免将整个文件加载到内存
  const fileStream = fs.createReadStream(filePath);
  try {
    await minioClient.putObject(bucketName, cleanFileName, fileStream, fileSize, {
      'Content-Type': mimeType,
    });

    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const videoUrl = `${protocol}://${process.env.MINIO_ENDPOINT}/${bucketName}/${cleanFileName}`;

    loggerHelper.logBusinessProcess('VideoUpload', '视频上传成功', {
      fileName: cleanFileName,
      size: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
    });

    return { videoUrl, fileName: cleanFileName };
  } finally {
    // 确保流被关闭
    fileStream.destroy();
  }
}

// 从URL中提取MinIO文件名
function extractFileNameFromUrl(videoUrl) {
  if (!videoUrl) return null;
  try {
    const urlPath = new URL(videoUrl).pathname;
    const prefix = `/${bucketName}/`;
    const idx = urlPath.indexOf(prefix);
    if (idx !== -1) {
      return decodeURIComponent(urlPath.substring(idx + prefix.length));
    }
    return path.basename(urlPath);
  } catch {
    return null;
  }
}

// 从MinIO删除视频文件
async function deleteVideoFromMinio(videoUrl) {
  const fileName = extractFileNameFromUrl(videoUrl);
  if (!fileName) {
    loggerHelper.logBusinessProcess('VideoUpload', '无法解析视频文件名，跳过删除', { videoUrl });
    return false;
  }
  try {
    await minioClient.removeObject(bucketName, fileName);
    loggerHelper.logBusinessProcess('VideoUpload', '视频文件已删除', { fileName, bucket: bucketName });
    return true;
  } catch (error) {
    loggerHelper.logError('删除MinIO视频文件失败', error);
    return false;
  }
}

// 清理临时文件
function cleanupTempFile(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    loggerHelper.logError('清理临时文件失败', err);
  }
}

// 中间件：处理视频上传
const extractVideoUrl = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const recordData = {
      date: req.body.date,
      time: req.body.time,
    };

    const result = await uploadVideoToMinio(
      req.file.path,
      req.file.originalname,
      req.file.mimetype,
      recordData
    );

    req.body.video_url = result.videoUrl;
    next();
  } catch (error) {
    loggerHelper.logError('处理视频上传失败', error);
    next(error);
  } finally {
    // 无论成功失败，都清理临时文件
    cleanupTempFile(req.file.path);
  }
};

module.exports = {
  upload,
  extractVideoUrl,
  deleteVideoFromMinio,
  extractFileNameFromUrl,
};
