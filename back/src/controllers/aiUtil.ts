import axios from "axios";
import logger from "../utils/logger";

const apiClient = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const generateAIResponse = async (model: string, prompt: any) => {
  const apiToken = process.env.OPENAI_API_KEY;

  if (!apiToken) {
    throw new Error("OpenAI API key not configured");
  }

  const payload = {
    model,
    messages: prompt,
  };

  try {
    const response = await apiClient.post("/chat/completions", payload, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    logger.error("Error generating response from OpenAI:", error);
    throw new Error("Failed to generate AI response");
  }
};

// Helper function to extract JSON from OpenAI response
export const extractFormattedContent = (
  format: "javascript" | "json",
  openAIResponse: string
) => {
  // todo: use format instead of javascript
  const matched = openAIResponse.match(/```javascript([\s\S]*?)```/);
  if (matched) {
    try {
      return matched[1].trim();
    } catch (error) {
      logger.error("Failed to parse JSON:", error);
      return null;
    }
  }
  return null;
};
