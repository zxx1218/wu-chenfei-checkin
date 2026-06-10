import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  title?: string;
}

export const ImageDialog = ({ open, onOpenChange, imageUrl, title }: ImageDialogProps) => {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" aria-describedby="image-dialog-description">
        <DialogHeader>
          <DialogTitle>{title || '奶茶图片'}</DialogTitle>
        </DialogHeader>
        <div id="image-dialog-description" className="mt-4">
          <img
            src={imageUrl}
            alt="奶茶照片"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
