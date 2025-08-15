
import { GoogleGenAI, Type } from "@google/genai";
import { SlideData } from '../types';

// The API key MUST be obtained from the environment variable `process.env.API_KEY`.
// Assume this variable is pre-configured and accessible in the execution context.

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * Throws a specific error if the API_KEY environment variable is not set,
 * allowing for clearer feedback to the user.
 */
const getAi = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        // Add a more robust check. The Vite build process might replace an undefined
        // environment variable with the literal string "undefined".
        if (!apiKey || apiKey === "undefined") {
            throw new Error('API_KEY environment variable not set. Please configure it in your deployment environment.');
        }
        ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return ai;
};


const presentationSchema = {
    type: Type.OBJECT,
    properties: {
        slides: {
            type: Type.ARRAY,
            description: "An array of all presentation slides.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "The title of the slide. Should be concise and engaging."
                    },
                    content: {
                        type: Type.ARRAY,
                        description: "The key points for the slide, presented as a list of strings. The format depends on the chosen layout. For chart or hierarchy layouts, this should be a single string containing a valid JSON object.",
                        items: {
                            type: Type.STRING,
                            description: "A single content point. Format depends on layout (e.g., 'icon :: title :: desc' for features, or a JSON string for charts/hierarchy)."
                        }
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A simple, descriptive English prompt (5-10 words) for generating a relevant, professional image. E.g., 'a team collaborating around a modern whiteboard'. For chart or infographic layouts, this can be an empty string."
                    },
                    layout: {
                        type: Type.STRING,
                        description: "The most appropriate layout for this slide's content. Must be one of: 'default', 'timeline', 'blocks', 'title', 'quote', 'comparison', 'features', 'cta', 'bar-chart', 'pie-chart', 'line-chart', 'swot-analysis', 'process-flow', 'circular-diagram', 'hierarchy'."
                    }
                },
                required: ["title", "content", "imagePrompt", "layout"]
            }
        }
    },
    required: ["slides"]
};


const generateContent = async (contents: any, pageCount: number): Promise<{ slides: Omit<SlideData, 'id' | 'imageUrl' | 'imagePosition'>[] }> => {
     try {
        const response = await getAi().models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction: `You are a professional presentation creation assistant. Your task is to take user-provided content and structure it into a clear, concise, and professional presentation of approximately ${pageCount} slides. For each slide, you must:
1.  Provide a title and content.
2.  Choose the most appropriate layout from the available options.
    - 'default': Standard text with bullet points.
    - 'timeline': Chronological events. Format content as 'DATE :: Event description.'
    - 'blocks': 2-4 distinct ideas.
    - 'title': Main title slide. 'content' has one item: the subtitle.
    - 'quote': A quote. 'content' has two items: [quote, author].
    - 'comparison': Side-by-side comparison. 'content' has four items: [left_title, left_content, right_title, right_content].
    - 'features': 2-4 key features. 'content' items format: 'icon_name :: Feature Title :: Description'. icon_name is one of 'lightbulb', 'shield', 'rocket', 'cog'.
    - 'process-flow': For sequential steps. 'content' contains multiple strings, each being one step in the flow.
    - 'swot-analysis': For Strengths, Weaknesses, Opportunities, Threats. 'content' must have exactly four items in this order: [strengths_text, weaknesses_text, opportunities_text, threats_text]. Each item can contain newlines.
    - 'circular-diagram': For cyclical processes or items related to a central theme (the slide title). 'content' is an array of strings, each being an item in the circle.
    - For data-driven or structured content, use a specific layout. The 'content' array must contain a SINGLE string of a valid JSON object.
    - 'bar-chart': For comparing quantities. JSON format: '[{"label": "string", "value": number}]'.
    - 'pie-chart': For showing parts of a whole. JSON format: '[{"label": "string", "value": number}]'.
    - 'line-chart': For showing trends over time. JSON format: '[{"label": "string", "value": number}]'.
    - 'hierarchy': For organizational charts or ranked structures. JSON format: '{"name": "Root", "children": [{"name": "Child 1", "children": [...]}]}'.
3.  Provide an English prompt for a background image. For chart or infographic layouts, this can be empty.
4.  Respond in Traditional Chinese for all title and user-visible content fields.
Your entire response must be a single JSON object conforming to the provided schema.`,
                responseMimeType: "application/json",
                responseSchema: presentationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("Received an empty response from the AI.");
        }

        const parsedJson = JSON.parse(jsonText);
        
        if (!parsedJson.slides || !Array.isArray(parsedJson.slides)) {
            throw new Error("Invalid JSON structure received. 'slides' array is missing.");
        }

        return parsedJson;

    } catch (error) {
        console.error("Error generating presentation content:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error for content generation: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI for content generation.");
    }
}


export const generatePresentationFromText = async (text: string, pageCount: number): Promise<{ slides: Omit<SlideData, 'id' | 'imageUrl' | 'imagePosition'>[] }> => {
    const prompt = `Please organize the following text into a presentation of about ${pageCount} slides. Each slide should have a title, several key points, a layout, and an image prompt. Please output in JSON format and follow the specified schema.\n\nTEXT: "${text}"`;
    return generateContent(prompt, pageCount);
};

export const generatePresentationFromAudio = async (audio: { mimeType: string, data: string }, pageCount: number): Promise<{ slides: Omit<SlideData, 'id' | 'imageUrl' | 'imagePosition'>[] }> => {
    const audioPart = { inlineData: { mimeType: audio.mimeType, data: audio.data } };
    const textPart = { text: `Please transcribe the audio and then organize the transcribed text into a presentation of about ${pageCount} slides. Each slide should have a title, several key points, a layout, and an image prompt. Please output in JSON format and follow the specified schema.` };
    return generateContent({ parts: [textPart, audioPart] }, pageCount);
};


export const generateImage = async (prompt: string): Promise<string> => {
    if (!prompt || prompt.trim() === '') return '';
    try {
        const response = await getAi().models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `Professional presentation background image, clear and modern, minimalist style: ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Image generation returned no images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch(error) {
        console.error(`Error generating image for prompt "${prompt}":`, error);
        // Don't rethrow, just return an empty string or a placeholder URL if you have one.
        // This prevents one failed image from failing the entire presentation generation.
        return ''; 
    }
};
