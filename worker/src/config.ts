// src/config.ts

import dotenv from "dotenv";
dotenv.config();

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.CLAUDE_API_KEY,
  nativishApiUrl: process.env.NATIVISH_API_URL || "",
  nativishAuthToken: process.env.NATIVISH_AUTH_TOKEN || "",
};
