import { GoogleGenAI } from "@google/genai";
import { Camp, DocType } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const auditCampData = async (camp: Camp): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Ошибка: API ключ не найден.";

  // Construct a prompt based on camp data
  const docSummary = camp.documents.map(d => `- ${d.type}: ${d.fileName} (${d.status})`).join('\n');
  
  const prompt = `
    Вы - ИИ-аудитор для Министерства Образования. Проверьте данные детского лагеря на соответствие требованиям реестра.
    
    Данные лагеря:
    Название: ${camp.name}
    ИНН: ${camp.inn}
    ОКТМО: ${camp.oktmo}
    Адрес: ${camp.address}
    Директор: ${camp.directorName}
    
    Загруженные документы:
    ${docSummary}
    
    Требования:
    1. ИНН и ОКТМО должны быть заполнены.
    2. Должны быть загружены обязательные документы: "Пожарная безопасность" и "Заключение СЭС".
    
    Сформируйте краткий отчет (макс 100 слов). Если чего-то не хватает, выделите это. Если все хорошо, подтвердите готовность к сезону.
    Отвечай на русском языке официально-деловым стилем.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Не удалось получить ответ от ИИ.";
  } catch (error) {
    console.error("AI Audit error:", error);
    return "Ошибка при обращении к сервису аудита.";
  }
};