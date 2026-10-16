import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  maxSizeMB?: number;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { maxSizeMB = 5 } = options;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast(`图片太大，请选择小于 ${maxSizeMB}MB 的图片`, { icon: '⚠️' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast('请选择图片文件', { icon: '⚠️' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB],
  );

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setPreviewImage(null);
    setFileInputKey((k) => k + 1);
  }, []);

  const resetImage = useCallback(() => {
    setSelectedImage(null);
    setPreviewImage(null);
    setFileInputKey((k) => k + 1);
  }, []);

  return {
    selectedImage,
    previewImage,
    fileInputKey,
    handleImageSelect,
    clearImage,
    resetImage,
  };
}
