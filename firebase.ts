import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export async function analyzeSkinPhoto(base64Image: string, profileInfo?: any, language: string = 'en') {
  try {
    let promptText = `Analyze this image of a user's face for skin conditions. Identify acne count, redness intensity (1-10), spot intensity (1-10), and oiliness (1-10). Provide a short feedback text (max 2 sentences) on how their skin looks and any immediate recommendations. Output JSON. Provide all text fields (feedback) in ${language === 'tr' ? 'Turkish' : 'English'}.`;
    
    if (profileInfo) {
      promptText += `\nAdditional user profile information:\n- Age: ${profileInfo.age || 'Not provided'}\n- Gender: ${profileInfo.gender || 'Not provided'}\n- Skin Type: ${profileInfo.skinType || 'Not provided'}\n- Smoker: ${profileInfo.smoking ? 'Yes' : 'No'}\n- Alcohol use: ${profileInfo.alcohol ? 'Yes' : 'No'}\n`;
      if (profileInfo.gender === 'female' || profileInfo.gender === 'kadın') {
         promptText += `- Currently menstruating: ${profileInfo.menstrualCycle ? 'Yes' : 'No'}\n`;
      }
      if (profileInfo.knownProblems) {
        promptText += `- User's known skin problems: ${profileInfo.knownProblems.join(", ")}\n`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { text: promptText },
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: "image/jpeg",
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            acneCount: { type: Type.NUMBER },
            redness: { type: Type.NUMBER },
            spots: { type: Type.NUMBER },
            oiliness: { type: Type.NUMBER },
            overallScore: { type: Type.NUMBER, description: "A score from 1-10 on skin health" },
            feedback: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
}

export async function analyzeIngredients(ingredientsText: string, skinIssues: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze these skincare ingredients: "${ingredientsText}". Identify the active ingredients and explain their benefits, especially related to ${skinIssues}. Keep the explanation under 3 sentences. Output as plain markdown text.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw error;
  }
}

export async function analyzeDailyLog(waterIntake: number, sleepHours: number, language: string = 'en') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `The user has recorded a daily water intake of ${waterIntake} ml and a sleep duration of ${sleepHours} hours. Analyze these numbers based on general healthy skin guidelines (e.g. roughly 2000ml to 3000ml water and 7-9 hours of sleep are generally good). Provide a very short, supportive tip or warning if they are at critical levels, connecting it to skin health. Maximum 2 sentences. Give me plain string output in ${language === 'tr' ? 'Turkish' : 'English'}.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analyze Daily Log Error:", error);
    return language === 'tr' ? "Su ve uyku takibine devam ederek cildin için daha iyi bir analiz yapmamıza yardımcı olabilirsin." : "Keep logging your water and sleep to better understand your skin's needs.";
  }
}

export async function recommendProductsFromAnalysis(analysisData: any, budget: string, currentProducts: any[], language: string = 'en') {
  try {
    const prompt = `Based on the skin analysis, recommend new skincare products. Don't recommend products they already have.
    Analysis: ${JSON.stringify(analysisData)}
    Budget: ${budget}
    Current Products: ${JSON.stringify(currentProducts.map(p => p.name))}
    
    Provide your response in ${language === 'tr' ? 'Turkish' : 'English'}.
    You should provide 'recommendations' array, each object: { "name": "...", "brand": "...", "reason": "...", "routineTime": "am" | "pm" | "both", "ingredientsText": "..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  routineTime: { type: Type.STRING },
                  ingredientsText: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text.trim()).recommendations;
    return [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

export async function generateRoutineFromProducts(products: any[], language: string = 'en') {
  try {
    const prompt = `Create a morning (am) and evening (pm) skincare routine using ONLY the following products:
    ${JSON.stringify(products.map(p => p.name))}.
    Arrange them in the correct application order (e.g., cleanser, toner, serum, moisturizer, sunscreen).
    Provide response in ${language === 'tr' ? 'Turkish' : 'English'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            am: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { stepName: { type: Type.STRING }, recommendedProduct: { type: Type.STRING } }
              }
            },
            pm: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { stepName: { type: Type.STRING }, recommendedProduct: { type: Type.STRING } }
              }
            }
          }
        }
      }
    });
    if (response.text) return JSON.parse(response.text.trim());
    return { am: [], pm: [] };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { am: [], pm: [] };
  }
}