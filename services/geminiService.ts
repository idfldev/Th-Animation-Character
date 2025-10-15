import { GoogleGenAI, Modality } from "@google/genai";
import { Character, Background, ImageDataPart, TextPart, ModelName } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const base64ToGenaiparts = (base64: string): ImageDataPart => {
    const [header, data] = base64.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return {
        inlineData: {
            mimeType,
            data,
        }
    };
};

const getAspectRatioPrompt = (ratio: string): string => {
    switch (ratio) {
        case '16:9': return ' The image must have a widescreen, cinematic 16:9 aspect ratio.';
        case '9:16': return ' The image must have a vertical, portrait 9:16 aspect ratio, suitable for phone screens.';
        case '4:3': return ' The image must have a landscape 4:3 aspect ratio.';
        case '3:4': return ' The image must have a vertical 3:4 aspect ratio.';
        case '1:1':
        default:
            return ' The image must have a square 1:1 aspect ratio.';
    }
}

export const generateImages = async (
    prompt: string,
    characters: Character[],
    background: Background,
    model: ModelName,
    numberOfImages: number,
    aspectRatio: string,
): Promise<string[]> => {

    if (model === 'imagen-4.0-generate-001') {
        // Imagen 4 only uses the text prompt for highest quality generation
        const fullPrompt = `4K, high-resolution, masterpiece quality, ${prompt}`;
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: {
                  numberOfImages,
                  outputMimeType: 'image/png',
                  aspectRatio,
                },
            });
            return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
        } catch(error) {
            console.error("Error generating images with Imagen 4: ", error);
            throw new Error("Image generation with Imagen 4 failed.");
        }
    } else {
        // Gemini Flash Image uses reference images for character consistency
        const aspectRatioText = getAspectRatioPrompt(aspectRatio);
        const fullPrompt = `Create a 4K, high-resolution, masterpiece-quality image based on the following description: "${prompt}".${aspectRatioText}
Use the provided reference images for the characters.`;

        const parts: (TextPart | ImageDataPart)[] = [{ text: fullPrompt }];

        characters.forEach(char => {
            if (char.image) {
                parts.push(base64ToGenaiparts(char.image));
            }
        });

        if (background.use && background.image) {
            parts.unshift({ text: "Important: Use the provided background image as the exact setting for the scene. Place the characters within this background. Do not alter the background itself." });
            parts.push(base64ToGenaiparts(background.image));
        }
        
        const generateSingleImage = async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart && imagePart.inlineData) {
                const base64ImageBytes: string = imagePart.inlineData.data;
                const mimeType = imagePart.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
            throw new Error("Image generation failed or API did not return an image.");
        };

        // Generate images in parallel based on numberOfImages
        const imagePromises = Array(numberOfImages).fill(0).map(() => generateSingleImage());
        
        try {
            const results = await Promise.all(imagePromises);
            return results;
        } catch(error) {
            console.error("Error generating images in parallel: ", error);
            throw new Error("One or more image generations failed.");
        }
    }
};