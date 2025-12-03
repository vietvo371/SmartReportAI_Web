import Groq from "groq-sdk";

// Initialize Groq client
export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Export configuration
export const groqConfig = {
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || "2048"),
    temperature: parseFloat(process.env.GROQ_TEMPERATURE || "0.7"),
};
