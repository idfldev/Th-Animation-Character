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

export const generateImages = async (
    prompt: string,
    characters: Character[],
    background: Background,
    model: ModelName
): Promise<string[]> => {

    if (model === 'imagen-4.0-generate-001') {
        // Imagen 4 only uses the text prompt for highest quality generation
        const fullPrompt = `4K, high-resolution, masterpiece quality, ${prompt}`;
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: {
                  numberOfImages: 4,
                  outputMimeType: 'image/png',
                  aspectRatio: '1:1',
                },
            });
            return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
        } catch(error) {
            console.error("Error generating images with Imagen 4: ", error);
            throw new Error("Image generation with Imagen 4 failed.");
        }
    } else {
        // Gemini Flash Image uses reference images for character consistency
        const fullPrompt = `Create a 4K, high-resolution, masterpiece-quality image based on the following description: "${prompt}".
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

        // Generate 4 images in parallel
        const imagePromises = Array(4).fill(0).map(() => generateSingleImage());
        
        try {
            const results = await Promise.all(imagePromises);
            return results;
        } catch(error) {
            console.error("Error generating images in parallel: ", error);
            throw new Error("One or more image generations failed.");
        }
    }
};