import { GoogleGenAI } from "@google/genai";
import { CACHE_CONFIG } from "./constants";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GenerateContentParams {
  apiKey: string;
  cacheName: string | null;
  userMessage: string;
  careerContext?: string;
  conversationHistory?: ChatMessage[];
}

export async function generateAIResponse(
  params: GenerateContentParams
): Promise<string> {
  const { apiKey, cacheName, userMessage, careerContext, conversationHistory = [] } = params;

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Build conversation history for context
    const historyMessages = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    if (cacheName) {
      const response = await ai.models.generateContent({
        model: CACHE_CONFIG.MODEL_NAME,
        contents: [
          ...historyMessages,
          {
            role: 'user',
            parts: [{ text: userMessage }]
          }
        ],
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
        ...historyMessages,
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
