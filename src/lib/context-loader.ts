import path from "node:path";
import * as fs from "node:fs";

export function loadCareerContext(): string {
  try {
    const contextFilePath = path.join(process.cwd(), "src", "data", "career_context.txt");
    const systemPromptPath = path.join(process.cwd(), "src", "data", "system_prompt.txt");

    const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');
    const careerData = fs.readFileSync(contextFilePath, 'utf-8');

    return `${systemPrompt}\n\n${careerData}`;
  } catch (error) {
    console.error("Failed to load career context:", error);

    return `
      Anda adalah Personal AI Assistant untuk Moses Samosir. 
      Gagal memuat data karir dari file. 
      Jawablah hanya dengan informasi dasar ini:
      Moses adalah seorang Full Stack Developer yang mencari peluang baru.
    `;
  }
}
