import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ClassificationResult {
  prediction: "Spiral" | "Elliptical" | "Irregular";
  confidence: number;
  explanation: string;
  topPredictions: { label: string; confidence: number }[];
}

export interface FactCheckResult {
  claimAnalysis: string;
  verdict: "True" | "Partially True" | "False" | "Insufficient Evidence";
  explanation: string;
  supportingEvidence: string[];
  additionalContext?: string;
  confidenceLevel: "High" | "Medium" | "Low";
}

export async function classifyGalaxy(base64Image: string): Promise<ClassificationResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Classify this galaxy image into one of these three categories: Spiral, Elliptical, or Irregular. 
  Provide the result in JSON format with the following fields:
  - prediction: one of "Spiral", "Elliptical", "Irregular"
  - confidence: a number between 0 and 1
  - explanation: a brief 1-sentence explanation of why it was classified this way.
  - topPredictions: an array of the top 2 predictions with their labels and confidence scores.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prediction: { type: Type.STRING, enum: ["Spiral", "Elliptical", "Irregular"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          topPredictions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ["label", "confidence"],
            },
          },
        },
        required: ["prediction", "confidence", "explanation", "topPredictions"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to classify image");
  }
}

export async function verifySpaceClaim(query: string): Promise<FactCheckResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are "AstroCheck," an intelligent space fact-checking assistant.
  Your purpose is to verify, explain, and validate any user-provided query related to space, astronomy, astrophysics, satellites, galaxies, or cosmology using reliable, search-based information.
  
  Role & Behavior:
  - Act as a scientific fact-checker, not a conversational chatbot.
  - Use Google Search data as your primary knowledge source.
  - Focus strictly on accuracy, clarity, and evidence-based responses.
  - Avoid speculation, assumptions, or invented facts.
  - If the query is not space-related, politely decline and explain your scope.
  
  Output Requirements:
  - Claim Analysis: Restate the user's input clearly.
  - Verdict: True, Partially True, False, or Insufficient Evidence.
  - Explanation: Concise, factual explanation.
  - Supporting Evidence: Key points derived from search results.
  - Additional Context: Extra scientific context if relevant.
  - Confidence Level: High, Medium, or Low.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: query }] }],
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          claimAnalysis: { type: Type.STRING },
          verdict: { type: Type.STRING, enum: ["True", "Partially True", "False", "Insufficient Evidence"] },
          explanation: { type: Type.STRING },
          supportingEvidence: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          additionalContext: { type: Type.STRING },
          confidenceLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        },
        required: ["claimAnalysis", "verdict", "explanation", "supportingEvidence", "confidenceLevel"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Failed to parse AstroCheck response:", error);
    throw new Error("Failed to verify claim");
  }
}
