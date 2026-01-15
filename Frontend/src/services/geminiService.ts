import Groq from "groq-sdk";
import type { OCLGenerationResponse } from "../components/Company/PolicyConverter/Data/types";

// Lazy initialization of Groq client (only when needed)
let groqClient: Groq | null = null;

const getGroqClient = (): Groq => {
  if (!groqClient) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GROQ_API_KEY is not set in environment variables");
    }
    groqClient = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for browser usage
    });
  }
  return groqClient;
};

export const generateOCLLogic = async (
  policyName: string,
  framework: string,
  policyText: string
): Promise<OCLGenerationResponse> => {
  
  const prompt = `
    You are an expert legal tech engineer specializing in Egyptian law.
    Task: Convert the following raw policy text into formal OCL (Object Constraint Language) logic.
    
    Policy Name: ${policyName}
    Legal Framework: ${framework}
    Policy Text: ${policyText}

    Return a JSON object with exactly these keys:
    1. "explanation": A clear explanation of which specific article of the framework this maps to.
    2. "oclCode": The OCL code (logic) that implements this rule. Use meaningful context names like "Contract::DataProcessing".
    3. "articleRef": The specific legal article reference string.
    4. "validation": An array of two objects with "label" and "standard" strings.
  `;

  try {
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      // Response format set to JSON mode
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more consistent logic output
    });

    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from Groq AI");
    }

    return JSON.parse(content) as OCLGenerationResponse;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};