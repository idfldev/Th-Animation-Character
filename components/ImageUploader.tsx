
import React, { useRef } from 'react';
import { UploadIcon, RemoveIcon } from './icons';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onImageUpload: (base64: string) => void;
  onImageRemove: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageUpload, onImageRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove();
    if(inputRef.current) {
        inputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative aspect-square w-full bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-center text-gray-400 cursor-pointer hover:border-purple-500 hover:text-purple-400 transition-colors group"
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      {image ? (
        <>
          <img src={image} alt={label} className="w-full h-full object-cover rounded-md" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleRemoveClick}
              className="absolute top-1 right-1 p-1.5 bg-red-600/80 rounded-full text-white hover:bg-red-500"
              title="Xóa ảnh"
            >
              <RemoveIcon />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <UploadIcon />
          <span className="text-xs mt-1">{label}</span>
        </div>
      )}
    </div>
  );
};
