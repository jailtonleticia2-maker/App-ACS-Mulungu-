import { GoogleGenerativeAI } from "@google/generative-ai";

// 👇 TEM que ser VITE_
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log("API KEY LIDA PELO VITE:", apiKey);

if (!apiKey) {
  throw new Error("API Key do Gemini não configurada");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiService = {
  generate: async (prompt: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
};
// ⚠️ Função mantida apenas para compatibilidade com o projeto original
export async function fetchHealthNews() {
  return geminiService.generate(
    "Liste 5 notícias recentes sobre saúde pública no Brasil."
  );
}