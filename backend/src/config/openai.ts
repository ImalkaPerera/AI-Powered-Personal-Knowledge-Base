import OpenAI from 'openai';

export const aiClient = new OpenAI({
  baseURL: "https://kb-openai-senesh.openai.azure.com/openai/v1",
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});