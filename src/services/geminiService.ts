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
      model: "gemini-1.5-flash", // Using 1.5-flash for broader stability as 3-flash-preview might be region-locked or unstable in current env
      contents: `Generate a comprehensive educational article and a 5-question quiz for a course titled: "${courseTitle}". The article should be high-quality, engaging, and at least 600 words long. The quiz must have 4 options per question and one correct answer index (0-3).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            article: { type: Type.STRING, description: "Detailed educational content." },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.NUMBER, description: "Index of correct option (0-3)" }
                },
                required: ["id", "text", "options", "correctAnswer"]
              }
            }
          },
          required: ["title", "article", "questions"]
        }
      }
    });

    if (!response || !response.text) {
      console.error("AI: Received empty response");
      throw new Error("AI Protocol Error: Null response from neural network.");
    }

    console.log("AI: Successfully generated curriculum for", courseTitle);
    return JSON.parse(response.text) as GeneratedCourse;
  } catch (error) {
    console.error("Gemini Critical Error:", error);
    if (error instanceof Error) {
      throw new Error(`AI Generation Failed: ${error.message}`);
    }
    throw new Error("AI Generation Failed: Unknown network error.");
  }
};
