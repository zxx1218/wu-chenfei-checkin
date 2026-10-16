import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Video, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

interface VideoUploadProps {
  onVideoSelect: (file: File | null) => void;
  currentVideoUrl?: string;
  onRemoveCurrentVideo?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

const VideoUpload = ({
  onVideoSelect,
  currentVideoUrl,
  onRemoveCurrentVideo,
  uploading = false,
  uploadProgress = 0,
}: VideoUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('video/')) {
      toast.error('请选择视频文件');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('视频文件不能超过5GB');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
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

  const removeVideo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    onVideoSelect(null);
    onRemoveCurrentVideo?.();
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const displayUrl = previewUrl || currentVideoUrl;

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
          onChange={(e) => handleFiles(e.target.files)}
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
                : '支持MP4、MOV、AVI等格式，最大5GB'}
            </p>

            {uploading && (
              <div className="w-full bg-primary/20 rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
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

      {displayUrl && !uploading && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
            <video
              src={displayUrl}
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
