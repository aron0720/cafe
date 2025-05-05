import { GoogleGenAI } from "@google/genai";

export async function streamTranslateText(
  text: string,
  apiKey: string,
  prompt: string,
  additionalPrompt: string,
  onChunk: (chunkText: string) => void // 콜백으로 조각마다 전달
) {
  const ai = new GoogleGenAI({ apiKey });
  const fullPrompt = prompt + additionalPrompt + '\n' + text;

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: fullPrompt }] }],
  });

  for await (const chunk of stream) {
    const chunkText = chunk.text;
    if (chunkText) {
      onChunk(chunkText);
    }
  }
}

export default streamTranslateText