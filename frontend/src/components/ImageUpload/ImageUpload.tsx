import { DropZone } from "./DropZone";

interface ImageUploadProps {
  onImageSelect: (files: File[]) => void;
  isProcessing: boolean;
}

export const ImageUpload = ({
  onImageSelect,
  isProcessing,
}: ImageUploadProps) => {
  return <DropZone onImageSelect={onImageSelect} isProcessing={isProcessing} />;
};
