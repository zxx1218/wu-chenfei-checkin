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
    // 构建文件名描述部分
    const descriptionParts = [];
    
    const {
      date, time, durationMinutes, position, passionScore, 
      oralSex, femaleOrgasm, oralExplosion, ejaculationMethod, scene,
      partnerOverallScore, partnerPassionScore, partnerDurationFeedback,
      partnerPositionFeedback, partnerComment, partnerReviewer, notes, // notes 是备注，需要排除
      ...otherFields
    } = recordData;

    if (date) descriptionParts.push(`日期_${date}`);
    if (time) descriptionParts.push(`时间_${time}`);
    if (durationMinutes) descriptionParts.push(`时长_${durationMinutes}分钟`);
    if (position) descriptionParts.push(`体位_${position.replace(/、/g, '_')}`); // 替换分隔符为下划线
    if (passionScore) descriptionParts.push(`激情_${passionScore}分`);
    if (oralSex !== undefined) descriptionParts.push(`口交_${oralSex ? '是' : '否'}`);
    if (femaleOrgasm !== undefined) descriptionParts.push(`高潮_${femaleOrgasm ? '是' : '否'}`);
    if (oralExplosion !== undefined) descriptionParts.push(`口爆_${oralExplosion ? '是' : '否'}`);
    if (ejaculationMethod) descriptionParts.push(`射精_${ejaculationMethod}`);
    if (scene) descriptionParts.push(`场景_${scene}`);
    if (partnerOverallScore) descriptionParts.push(`伴侣总分_${partnerOverallScore}`);
    if (partnerPassionScore) descriptionParts.push(`伴侣激情_${partnerPassionScore}`);
    if (partnerDurationFeedback) descriptionParts.push(`伴侣时长_${partnerDurationFeedback}`);
    if (partnerPositionFeedback) descriptionParts.push(`伴侣体位_${partnerPositionFeedback}`);
    if (partnerReviewer) descriptionParts.push(`评价者_${partnerReviewer}`);
    
    // 生成描述字符串
    const descriptionString = descriptionParts.join('_');
    
    // 生成带有记录信息的文件名
    const extension = path.extname(fileName) || '.mp4'; // 如果没有扩展名，默认为.mp4
    const timestamp = Date.now();
    const descriptiveFileName = `${descriptionString}_${timestamp}${extension}`;
    
    // 清理文件名中的特殊字符，使其适合用作对象存储键
    const cleanFileName = descriptiveFileName
      .replace(/[<>:"/\\|?*]/g, '_') // 替换不允许的字符
      .replace(/\s+/g, '_') // 替换空格为下划线
      .replace(/_{2,}/g, '_') // 替换多个连续下划线为单个
      .substring(0, 200); // 限制长度
    
    console.log(`开始上传视频到MinIO: ${cleanFileName}, 大小: ${fileBuffer.length} bytes, MIME类型: ${mimeType}`);
    console.log(`目标存储桶: ${bucketName}`);
    console.log(`记录数据摘要:`, {
      date: recordData.date,
      time: recordData.time,
      duration: recordData.durationMinutes,
      position: recordData.position,
      passionScore: recordData.passionScore,
      oralSex: recordData.oralSex,
      femaleOrgasm: recordData.femaleOrgasm,
      oralExplosion: recordData.oralExplosion,
      ejaculationMethod: recordData.ejaculationMethod,
      scene: recordData.scene
    });
    
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