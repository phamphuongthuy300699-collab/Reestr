import { GoogleGenAI } from "@google/genai";
import { Camp } from "../types";

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
    Вы - эксперт отдела надзора Министерства Образования. Проведите аудит карточки лагеря для включения в Реестр (согласно Приказу № 509).
    
    АНКЕТА ОРГАНИЗАЦИИ:
    1. Наименование: ${camp.name} (${camp.legalForm})
    2. Руководитель: ${camp.directorName}
    3. ИНН: ${camp.inn} | ОКТМО: ${camp.oktmo}
    4. Адрес: ${camp.address}
    5. Тип: ${camp.campType} | Сезонность: ${camp.seasonality}
    6. Вместимость: ${camp.capacity} | Возраст: ${camp.ageCategory}
    7. СЭЗ (Санитарное заключение): Номер "${camp.sanitaryNumber}", Дата "${camp.sanitaryDate}"
    8. Медицина: "${camp.medicalLicense}"
    
    ЗАГРУЖЕННЫЕ ФАЙЛЫ:
    ${docSummary}
    
    КРИТЕРИИ ПРОВЕРКИ:
    1. Все поля раздела "СЭЗ" должны быть заполнены.
    2. Должны быть сведения о медицинской лицензии или договоре.
    3. Среди файлов ОБЯЗАТЕЛЬНО должны быть: "Пожарная безопасность" и "Заключение СЭС".
    
    ЗАДАЧА:
    Сформируйте заключение (макс 100 слов).
    - Если данных не хватает (особенно СЭЗ или Медицины), напишите "ОТКАЗ: [причина]".
    - Если все ок, напишите "РЕКОМЕНДОВАНО К ВКЛЮЧЕНИЮ".
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