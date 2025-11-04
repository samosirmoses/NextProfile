import { GoogleGenAI } from "@google/genai";
import { CACHE_CONFIG } from "./constants";

interface GenerateContentParams {
  apiKey: string;
  cacheName: string | null;
  userMessage: string;
  careerContext?: string;
}

export async function generateAIResponse(
  params: GenerateContentParams
): Promise<string> {
  const { apiKey, cacheName, userMessage, careerContext } = params;

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (cacheName) {
      const response = await ai.models.generateContent({
        model: CACHE_CONFIG.MODEL_NAME,
        contents: userMessage,
        config: {
          cachedContent: cacheName,
          temperature: 1,
          maxOutputTokens: 1024,
          topK: 40,
          topP: 0.95,
        },
      });

      const text = response.text || "";
      return text.trim();
    }

    if (!careerContext) {
      throw new Error("Career context is required when cache is not available");
    }

    const response = await ai.models.generateContent({
      model: CACHE_CONFIG.MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            { text: `Context:\n${careerContext}\n\nQuestion: ${userMessage}` }
          ],
        },
      ],
      config: {
        systemInstruction: CACHE_CONFIG.SYSTEM_INSTRUCTION,
        temperature: 1,
        maxOutputTokens: 1024,
        topK: 40,
        topP: 0.95,
      },
    });

    const text = response.text || "";
    return text.trim();

  } catch (error) {
    console.error("AI generation error:", error);

    if (error instanceof Error) {
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }

    throw new Error("Failed to generate AI response");
  }
}
