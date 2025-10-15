import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { generateImages } from './services/geminiService';
import { Character, Background, ModelName } from './types';

const initialCharacters: Character[] = [
  { id: 1, label: 'Nhân vật 1', image: null, selected: false },
  { id: 2, label: 'Nhân vật 2', image: null, selected: false },
  { id: 3, label: 'Nhân vật 3', image: null, selected: false },
  { id: 4, label: 'Nhân vật 4', image: null, selected: false },
  { id: 5, label: 'Nhân vật 5', image: null, selected: false },
  { id: 6, label: 'Nhân vật 6', image: null, selected: false },
  { id: 7, label: 'Nhân vật 7', image: null, selected: false },
  { id: 8, label: 'Nhân vật 8', image: null, selected: false },
];

function App() {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [background, setBackground] = useState<Background>({ image: null, use: false });
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelName>('gemini-2.5-flash-image');
  const [numberOfImages, setNumberOfImages] = useState<number>(4);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImagesResult, setGeneratedImagesResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCharacterChange = useCallback((id: number, image: string | null, selected?: boolean) => {
    setCharacters(prev =>
      prev.map(char => {
        if (char.id === id) {
          const updatedChar = { ...char, image: image !== undefined ? image : char.image };
          if (selected !== undefined) {
            updatedChar.selected = selected;
          }
          // Automatically select character if image is uploaded
          if (image) {
            updatedChar.selected = true;
          }
          if (image === null) {
              updatedChar.selected = false;
          }
          return updatedChar;
        }
        return char;
      })
    );
  }, []);

  const handleBackgroundChange = useCallback((image: string | null) => {
    setBackground(prev => ({ ...prev, image }));
  }, []);

  const handleUseBackgroundToggle = useCallback(() => {
    setBackground(prev => ({ ...prev, use: !prev.use }));
  }, []);

  const handleGenerateClick = useCallback(async () => {
    const selectedCharacters = characters.filter(c => c.selected && c.image);
    if (selectedModel === 'gemini-2.5-flash-image' && selectedCharacters.length === 0) {
      setError('Vui lòng tải lên và chọn ít nhất một nhân vật cho model Gemini.');
      return;
    }
    if (!prompt.trim()) {
      setError('Vui lòng nhập câu lệnh mô tả.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImagesResult([]);

    try {
      const result = await generateImages(prompt, selectedCharacters, background, selectedModel, numberOfImages, aspectRatio);
      setGeneratedImagesResult(result);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, characters, background, selectedModel, numberOfImages, aspectRatio]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 fixed top-0 left-0 right-0 z-10">
        <h1 className="text-2xl font-bold text-center text-purple-400">Thọ Animation</h1>
        <p className="text-center text-gray-400">Tạo ảnh nhân vật hoạt hình đồng nhất</p>
      </header>
      <main className="flex flex-col md:flex-row pt-28 max-w-screen-2xl mx-auto p-4 gap-8">
        <div className="w-full md:w-1/3 xl:w-1/4 flex-shrink-0">
          <ControlPanel
            characters={characters}
            background={background}
            prompt={prompt}
            isLoading={isLoading}
            selectedModel={selectedModel}
            numberOfImages={numberOfImages}
            aspectRatio={aspectRatio}
            onCharacterChange={handleCharacterChange}
            onBackgroundChange={handleBackgroundChange}
            onUseBackgroundToggle={handleUseBackgroundToggle}
            onPromptChange={setPrompt}
            onModelChange={setSelectedModel}
            onNumberOfImagesChange={setNumberOfImages}
            onAspectRatioChange={setAspectRatio}
            onGenerate={handleGenerateClick}
          />
        </div>
        <div className="w-full md:w-2/3 xl:w-3/4">
          <ResultsPanel 
            images={generatedImagesResult} 
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}

export default App;