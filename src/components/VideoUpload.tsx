import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Video, X, Loader2 } from 'lucide-react';

interface VideoUploadProps {
  onVideoSelect: (file: File | null) => void;
  currentVideoUrl?: string;
  onRemoveCurrentVideo?: () => void;
  uploading?: boolean; // 添加上传状态属性
  uploadProgress?: number; // 添加上传进度属性
}

const VideoUpload: React.FC<VideoUploadProps> = ({ 
  onVideoSelect, 
  currentVideoUrl, 
  onRemoveCurrentVideo,
  uploading = false,
  uploadProgress = 0
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      alert('请选择视频文件！');
      return;
    }

    // 验证文件大小（限制为100GB）
    if (file.size > 100 * 1024 * 1024 * 1024) {
      alert('视频文件不能超过100GB！');
      return;
    }

    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // 传递给父组件
    onVideoSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeVideo = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onVideoSelect(null);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept="video/*"
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <Video className="w-6 h-6 text-primary" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {uploading ? (
                <span>正在上传视频...</span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="text-primary font-bold underline hover:no-underline"
                    disabled={uploading}
                  >
                    点击上传
                  </button>{' '}
                  或拖拽视频文件到此处
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {uploading 
                ? `上传进度: ${uploadProgress}%` 
                : '支持MP4、MOV、AVI等视频格式，最大100GB'}
            </p>
            
            {/* 上传进度条 */}
            {uploading && (
              <div className="w-full bg-primary/20 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <Button
            type="button"
            onClick={triggerFileSelect}
            variant="outline"
            size="sm"
            className="mt-2 rounded-full"
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            选择视频
          </Button>
        </div>
      </div>

      {(previewUrl || currentVideoUrl) && !uploading && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
            <video
              src={previewUrl || currentVideoUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          
          <Button
            type="button"
            onClick={removeVideo}
            variant="outline"
            className="w-full rounded-2xl border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-2" />
            移除视频
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;