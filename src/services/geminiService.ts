import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization function to ensure we catch missing key errors at runtime
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from environment. Check AI Studio settings.");
    throw new Error("AI Protocol Error: Identification Key missing. Please ensure your Gemini API Key is configured.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface GeneratedCourse {
  title: string;
  article: string;
  questions: {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export const generateCourseContent = async (courseTitle: string): Promise<GeneratedCourse> => {
  try {
    console.log("AI: Initializing construction for topic:", courseTitle);
    const ai = getAI();
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a comprehensive educational article and a 5-question quiz for a course titled: "${courseTitle}".
      
      Requirements:
      - Article: High-quality, technical, engaging, at least 800 words.
      - Quiz: 5 questions, 4 options each, one correct answer index (0-3).
      - Output MUST be valid JSON according to the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            article: { type: Type.STRING, description: "Full educational content (Markdown allowed)" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    minItems: 4,
                    maxItems: 4
                  },
                  correctAnswer: { type: Type.NUMBER, description: "Correct option index (0-3)" }
                },
                required: ["id", "text", "options", "correctAnswer"]
              },
              minItems: 5,
              maxItems: 5
            }
          },
          required: ["title", "article", "questions"]
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("AI Protocol Error: Neural network returned an empty frequency.");
    }
    
    // Direct parse from response.text is recommended when using responseMimeType: "application/json"
    let aiData;
    try {
      aiData = JSON.parse(response.text.trim());
    } catch (e) {
      // Fallback: try to extract JSON if formatted with markdown blocks
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         aiData = JSON.parse(jsonMatch[0]);
      } else {
         throw e;
      }
    }
    
    return aiData as GeneratedCourse;
  } catch (error) {
    console.error("Gemini Critical Error:", error);
    if (error instanceof Error) {
      throw new Error(`AI Generation Failed: ${error.message}`);
    }
    throw new Error("AI Generation Failed: Unknown network error.");
  }
};
