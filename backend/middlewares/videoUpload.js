const multer = require('multer');
const { minioClient, bucketName } = require('../config/minio');
const path = require('path');

// 配置multer用于处理文件上传
const storage = multer.memoryStorage(); // 将文件存储在内存中
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 限制文件大小为50MB
  },
  fileFilter: (req, file, cb) => {
    // 只接受视频文件
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传视频文件!'), false);
    }
  }
});

// 上传视频到MinIO
const uploadVideoToMinio = async (fileBuffer, fileName, mimeType) => {
  try {
    // 生成唯一的文件名
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // 上传文件到MinIO，使用正确的Content-Type
    await minioClient.putObject(bucketName, uniqueFileName, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType // 使用实际的文件MIME类型
    });
    
    // 返回文件的访问URL
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const videoUrl = `${protocol}://${process.env.MINIO_ENDPOINT}/${bucketName}/${uniqueFileName}`;
    
    return videoUrl;
  } catch (error) {
    console.error('上传视频到MinIO失败:', error);
    throw error;
  }
};

// 从请求中提取视频URL
const extractVideoUrl = async (req, res, next) => {
  try {
    // 如果有视频文件上传
    if (req.file) {
      // 上传视频到MinIO并获取URL
      const videoUrl = await uploadVideoToMinio(req.file.buffer, req.file.originalname, req.file.mimetype);
      
      // 将视频URL添加到请求体中
      req.body.video_url = videoUrl;
    }
    
    next();
  } catch (error) {
    console.error('处理视频上传失败:', error);
    res.status(500).json({ error: '视频上传失败' });
  }
};

module.exports = {
  upload,
  extractVideoUrl
};