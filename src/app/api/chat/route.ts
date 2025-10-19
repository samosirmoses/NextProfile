import path from "node:path";
import * as fs from "node:fs";
import {NextResponse} from "next/server";

const CONTEXT_FILE_PATH = path.join(process.cwd(), "src", "data", "career_context.txt");

const SYSTEM_PROMPT = path.join(process.cwd(), "src", "data", "system_prompt.txt");

const ai_character = {
    id: 'moses-ai-assistant',
    name: 'Moses Ai-Assistant',
    display_name: 'Moses Ai-Assistant',
    avatar: '🤖',
    tone: 'Profesional, ramah, dan informatif',
    description: 'Personal AI Assistant untuk Moses Samosir. Menjawab pertanyaan berdasarkan CV dan pengalaman karir Moses.',
        personality: 'Helpful and knowledgeable about Moses Samosir\'s career and skills'
}

let careerContext: string;

try {
    const system_prompt = fs.readFileSync(SYSTEM_PROMPT, 'utf-8');
    const career_data = fs.readFileSync(CONTEXT_FILE_PATH, 'utf-8');

        careerContext = `${system_prompt}\n${career_data}`
} catch (error) {
    careerContext = `
    Anda adalah Personal AI Assistant untuk Moses Samosir. 
    Gagal memuat data karir dari file. 
    Jawablah hanya dengan informasi dasar ini:
     Moses adalah seorang Full Stack Developer yang mencari peluang baru.`;
}

export async function POST(req: Request) {
    try {
        const {message} = await req.json();

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return NextResponse.json(
                {message: 'Pesan tidak boleh kosong.'},
                {status: 400}
            );
        }

        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {message: 'Konfigurasi server belum lengkap. Hubungi administrator.'},
                {status: 500}
            );
        }

        const prompt = `${careerContext}
        pertanyaan user: ${message}`

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 1,
                        maxOutputTokens: 1024,
                        topK: 40,
                        topP: 0.95,
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return NextResponse.json(
                    {message: 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.'},
                    {status: 500}
                );
            }
            const data = await response.json();

            // Validate that data.candidates exists and has at least one element
            if (
                !data ||
                !Array.isArray(data.candidates) ||
                data.candidates.length < 1
            ) {
                return NextResponse.json(
                    {message: 'Maaf, AI tidak memberikan respons yang valid. Silakan coba lagi.'},
                    {status: 500}
                );
            }

            const botMessage = data.candidates[0]?.content?.parts?.[0]?.text;
            const cleanedMessage = String(botMessage ?? '').trim();
            const maxWordsPerBubble = 50;
            const maxBubbles = 6;

            const messageParts: string[] = [];

                        const paragraphs = cleanedMessage.split(/\n\n+/).filter(p => p.trim() !== '');

            if (paragraphs.length < 1) {
                messageParts.push(cleanedMessage);
            } else {
                let currentBubble = '';
                let currentWordCount = 0;

                for (const paragraph of paragraphs) {
                                        const sentences = paragraph.split(/([.?!])\s+/) || [paragraph];

                    for (const sentence of sentences) {
                        const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
                        const sentenceWordCount = sentenceWords.length;

                        if (currentWordCount + sentenceWordCount > maxWordsPerBubble && currentBubble.trim()) {
                            messageParts.push(currentBubble.trim());
                            currentBubble = sentence.trim()
                            currentWordCount = sentenceWordCount;
                        } else {
                            currentBubble += (currentBubble ? ' ' : '') + sentence.trim();
                            currentWordCount += sentenceWordCount;
                        }

                        if (messageParts.length >= maxBubbles - 1) {
                            break;
                        }
                    }
                    if (messageParts.length >= maxBubbles - 1) {
                        break;
                    }
                    if (currentWordCount < maxWordsPerBubble * 0.8) {
                        currentBubble += '\n\n';
                    }
                }

                if (currentBubble.trim()) {
                    messageParts.push(currentBubble.trim());
                }

                if (messageParts.length >= maxBubbles) {
                    const totalAddedWords = messageParts.reduce((sum, part) =>
                        sum + part.split(/\s+/).filter(Boolean).length, 0
                    );
                    const allWords = cleanedMessage.split(/\s+/).filter(Boolean);

                    if (totalAddedWords < allWords.length) {
                        const remainingText = allWords.slice(totalAddedWords).join(' ');
                        if (remainingText.trim()) {
                            messageParts[messageParts.length - 1] += ' ' + remainingText.trim();
                        }
                    }
                }
            }

            if (messageParts.length === 0) {
                messageParts.push(cleanedMessage);
            }

            return NextResponse.json({
                message: cleanedMessage,
                messageParts: messageParts,
                success: true,
                character: ai_character,
                responseLength: cleanedMessage.length,
                totalParts: messageParts.length,
                timestamp: new Date().toISOString()
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    {message: 'Request timeout. Silakan coba lagi dengan pertanyaan yang lebih singkat.'},
                    {status: 408}
                );
            }

            throw fetchError;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal.";

        return NextResponse.json(
            {message: `⚠️ Ups! Terjadi kesalahan koneksi/server. Detail: ${errorMessage}`},
            {status: 500}
        );
    }
}