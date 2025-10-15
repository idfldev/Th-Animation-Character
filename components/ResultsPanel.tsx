
import React, { useState } from 'react';
import { DownloadIcon, ViewIcon, CloseIcon } from './icons';

interface ResultsPanelProps {
  images: string[];
  isLoading: boolean;
  error: string | null;
}

const ImageCard: React.FC<{ src: string; onPreview: () => void }> = ({ src, onPreview }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `tho-animation-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <img src={src} alt="Generated character" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
        <button onClick={onPreview} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors">
          <ViewIcon />
        </button>
        <button onClick={handleDownload} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors">
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, isLoading, error }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <svg className="animate-spin h-12 w-12 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-xl font-semibold">AI đang vẽ...</h3>
          <p className="text-gray-400 mt-2">Quá trình này có thể mất một chút thời gian. Vui lòng chờ nhé!</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
           <p className="text-red-400">{error}</p>
        </div>
      );
    }
    
    if (images.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {images.map((img, index) => (
            <ImageCard key={index} src={img} onPreview={() => setPreviewImage(img)} />
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-400">Kết quả sẽ được hiển thị ở đây</h3>
        <p className="text-gray-500 mt-2">Sau khi bạn điền thông tin và nhấn "Tạo ảnh", 4 phiên bản sẽ xuất hiện tại đây.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 shadow-xl min-h-[calc(100vh-10rem)] flex flex-col justify-center">
      {renderContent()}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full">
            <CloseIcon />
          </button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
};
