import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types";

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "Atualização sobre o Piso Salarial Nacional 2025",
    summary: "Informações sobre o repasse da assistência financeira complementar da União.",
    content:
      "O cronograma de repasses referente ao piso salarial dos agentes de saúde segue o fluxo estabelecido pelo Fundo Nacional de Saúde...",
    date: "15/05/2025",
    url: "https://www.gov.br/saude/pt-br"
  }
];

export const fetchHealthNews = async (): Promise<NewsItem[]> => {
  try {
    const ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents:
        "Liste as 6 notícias MAIS RECENTES (maio de 2025)...",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              date: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["title", "summary", "content", "date", "url"]
          }
        }
      }
    });

    const text = response.text;

    if (text) {
      const parsed = JSON.parse(text.trim());
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : FALLBACK_NEWS;
    }

    return FALLBACK_NEWS;
  } catch (error) {
    console.error("Erro ao buscar notícias Gemini:", error);
    return FALLBACK_NEWS;
  }
};