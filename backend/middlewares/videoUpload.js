const multer = require('multer');
const { minioClient, bucketName } = require('../config/minio');
const path = require('path');

// 配置multer用于处理文件上传
const storage = multer.memoryStorage(); // 将文件存储在内存中
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 * 1024, // 限制文件大小为100GB
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
const uploadVideoToMinio = async (fileBuffer, fileName, mimeType, recordData) => {
  try {
    // 获取日期，格式化为 YYYYMMDD
    let dateStr = '';
    if (recordData.date) {
      // 移除日期中的连字符，转换为 YYYYMMDD 格式
      dateStr = recordData.date.replace(/-/g, '');
    } else {
      // 如果没有日期，使用当前日期
      const now = new Date();
      dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    }

    // 获取时间（如果存在）
    let timeStr = '';
    if (recordData.time) {
      // 移除时间中的冒号，格式化为 HHMMSS
      timeStr = recordData.time.replace(/:/g, '');
    }

    // 生成文件扩展名
    const extension = path.extname(fileName) || '.mp4';

    // 生成简短的文件名：日期_时间戳.extension
    // 格式：YYYYMMDD_HHMMSS_时间戳.mp4 或 YYYY-MM-DD_时间戳.mp4
    const timestamp = Date.now();
    const shortFileName = timeStr
      ? `${dateStr}_${timeStr}_${timestamp}${extension}`
      : `${dateStr}_${timestamp}${extension}`;

    // 清理文件名中的特殊字符
    const cleanFileName = shortFileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_');

    console.log(`开始上传视频到MinIO: ${cleanFileName}, 大小: ${fileBuffer.length} bytes, MIME类型: ${mimeType}`);
    console.log(`目标存储桶: ${bucketName}`);
    
    // 上传文件到MinIO，使用正确的Content-Type
    await minioClient.putObject(bucketName, cleanFileName, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType // 使用实际的文件MIME类型
    });
    
    console.log(`✅ 视频上传成功: ${cleanFileName}`);
    
    // 返回文件的访问URL
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const videoUrl = `${protocol}://${process.env.MINIO_ENDPOINT}/${bucketName}/${cleanFileName}`;
    
    console.log(`🔗 生成的视频URL: ${videoUrl}`);
    
    return { videoUrl, fileName: cleanFileName };
  } catch (error) {
    console.error('❌ 上传视频到MinIO失败:', error);
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // 尝试列出存储桶内容以诊断问题
    try {
      const objects = await minioClient.listObjects(bucketName, '', true);
      console.log('存储桶内容列表:', objects);
    } catch (listError) {
      console.error('无法列出存储桶内容:', listError);
    }
    
    throw error;
  }
};

// 从请求中提取视频URL
const extractVideoUrl = async (req, res, next) => {
  try {
    // 如果有视频文件上传
    if (req.file) {
      // 将请求体中的字段映射为驼峰命名以匹配模型
      const recordData = {
        date: req.body.date,
        time: req.body.time,
        durationMinutes: req.body.duration_minutes || req.body.durationMinutes,
        position: req.body.position,
        passionScore: req.body.passion_score || req.body.passionScore,
        notes: req.body.notes, // 备注字段，需要排除
        oralSex: req.body.oral_sex || req.body.oralSex,
        femaleOrgasm: req.body.female_orgasm || req.body.femaleOrgasm,
        oralExplosion: req.body.oral_explosion || req.body.oralExplosion,
        ejaculationMethod: req.body.ejaculation_method || req.body.ejaculationMethod,
        scene: req.body.scene,
        partnerOverallScore: req.body.partner_overall_score || req.body.partnerOverallScore,
        partnerPassionScore: req.body.partner_passion_score || req.body.partnerPassionScore,
        partnerDurationFeedback: req.body.partner_duration_feedback || req.body.partnerDurationFeedback,
        partnerPositionFeedback: req.body.partner_position_feedback || req.body.partnerPositionFeedback,
        partnerComment: req.body.partner_comment || req.body.partnerComment,
        partnerReviewer: req.body.partner_reviewer || req.body.partnerReviewer,
      };
      
      console.log(`📝 准备上传视频，记录数据:`, recordData);
      
      // 上传视频到MinIO并获取URL
      const result = await uploadVideoToMinio(req.file.buffer, req.file.originalname, req.file.mimetype, recordData);
      
      // 将视频URL添加到请求体中
      req.body.video_url = result.videoUrl;
    }
    
    next();
  } catch (error) {
    console.error('❌ 处理视频上传失败:', error);
    res.status(500).json({ error: '视频上传失败' });
  }
};

module.exports = {
  upload,
  extractVideoUrl
};