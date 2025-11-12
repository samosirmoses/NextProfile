import { NextResponse } from "next/server";
import { loadCareerContext } from "@/lib/context-loader";
import { getOrCreateCache } from "@/lib/cache-manager";
import { generateAIResponse } from "@/lib/ai-service";
import { splitMessageIntoBubbles } from "@/lib/message-formatter";
import { formatForChat } from "@/lib/text-formatter";
import { AI_CHARACTER } from "@/lib/constants";


const careerContext = loadCareerContext();


export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { message: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: 'Server configuration incomplete. Please contact administrator.' },
        { status: 500 }
      );
    }

    const cacheName = await getOrCreateCache(apiKey, careerContext);

    const aiResponse = await generateAIResponse({
      apiKey,
      cacheName,
      userMessage: message,
      careerContext: cacheName ? undefined : careerContext,
      conversationHistory: history || [],
    });

    const cleanedResponse = formatForChat(aiResponse);
    const messageParts = splitMessageIntoBubbles(cleanedResponse);

    return NextResponse.json({
      message: cleanedResponse,
      messageParts: messageParts,
      success: true,
      character: AI_CHARACTER,
      responseLength: cleanedResponse.length,
      totalParts: messageParts.length,
      timestamp: new Date().toISOString(),
      usedCache: cacheName !== null,
    });

  } catch (error) {
    console.error("Chat API Error:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred.";

    return NextResponse.json(
      { message: `Unable to process request: ${errorMessage}` },
      { status: 500 }
    );
  }
}