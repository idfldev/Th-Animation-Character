import React from 'react';
import { Character, Background, ModelName } from '../types';
import { ImageUploader } from './ImageUploader';
import { CheckboxIcon, CheckboxCheckedIcon } from './icons';

interface ControlPanelProps {
  characters: Character[];
  background: Background;
  prompt: string;
  isLoading: boolean;
  selectedModel: ModelName;
  numberOfImages: number;
  aspectRatio: string;
  onCharacterChange: (id: number, image: string | null, selected?: boolean) => void;
  onBackgroundChange: (image: string | null) => void;
  onUseBackgroundToggle: () => void;
  onPromptChange: (value: string) => void;
  onModelChange: (model: ModelName) => void;
  onNumberOfImagesChange: (value: number) => void;
  onAspectRatioChange: (value: string) => void;
  onGenerate: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  characters,
  background,
  prompt,
  isLoading,
  selectedModel,
  numberOfImages,
  aspectRatio,
  onCharacterChange,
  onBackgroundChange,
  onUseBackgroundToggle,
  onPromptChange,
  onModelChange,
  onNumberOfImagesChange,
  onAspectRatioChange,
  onGenerate,
}) => {
  return (
    <div className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 shadow-xl space-y-6 sticky top-28">
      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Ảnh nhân vật tham chiếu</h2>
        <div className="grid grid-cols-2 gap-4">
          {characters.map(char => (
            <div key={char.id}>
              <ImageUploader
                label={char.label}
                image={char.image}
                onImageUpload={image => onCharacterChange(char.id, image)}
                onImageRemove={() => onCharacterChange(char.id, null)}
              />
              {char.image && (
                <button
                  onClick={() => onCharacterChange(char.id, char.image, !char.selected)}
                  className="flex items-center space-x-2 mt-2 text-sm text-gray-300 hover:text-white transition-colors w-full"
                >
                  {char.selected ? <CheckboxCheckedIcon /> : <CheckboxIcon />}
                  <span>Sử dụng nhân vật</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Bối cảnh tham chiếu</h2>
        <ImageUploader
          label="Tải ảnh nền"
          image={background.image}
          onImageUpload={onBackgroundChange}
          onImageRemove={() => onBackgroundChange(null)}
        />
        {background.image && (
          <button
            onClick={onUseBackgroundToggle}
            className="flex items-center space-x-2 mt-2 text-sm text-gray-300 hover:text-white transition-colors w-full"
          >
            {background.use ? <CheckboxCheckedIcon /> : <CheckboxIcon />}
            <span>Sử dụng bối cảnh này</span>
          </button>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Câu lệnh</h2>
        <textarea
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          placeholder="Mô tả hành động, bối cảnh, bố cục..."
          className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">AI Model</h2>
        <select
          value={selectedModel}
          onChange={e => onModelChange(e.target.value as ModelName)}
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          disabled={isLoading}
        >
          <option value="gemini-2.5-flash-image">Gemini Flash Image (Giữ nhân vật)</option>
          <option value="imagen-4.0-generate-001">Imagen 4 (Chất lượng cao)</option>
        </select>
         <p className="text-xs text-gray-400 mt-2">
            Lưu ý: Model Imagen 4 chỉ sử dụng câu lệnh, không dùng ảnh tham chiếu.
        </p>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Số lượng ảnh</h2>
        <select
          value={numberOfImages}
          onChange={e => onNumberOfImagesChange(Number(e.target.value))}
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          disabled={isLoading}
        >
          <option value={1}>1 ảnh</option>
          <option value={2}>2 ảnh</option>
          <option value={4}>4 ảnh</option>
        </select>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Khung ảnh</h2>
        <select
          value={aspectRatio}
          onChange={e => onAspectRatioChange(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          disabled={isLoading}
        >
          <option value="1:1">Vuông (1:1)</option>
          <option value="16:9">Ngang (16:9)</option>
          <option value="9:16">Dọc (9:16)</option>
          <option value="4:3">Ngang (4:3)</option>
          <option value="3:4">Dọc (3:4)</option>
        </select>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tạo...
          </>
        ) : (
          'Tạo ảnh'
        )}
      </button>
    </div>
  );
};