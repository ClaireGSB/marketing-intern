// src/llmTypes.ts

// -----------------------------------
// Anthropic-specific types ----------
// -----------------------------------

export interface AnthropicTextContent {
  type: "text";
  text: string;
}

export type AnthropicMessageContent = AnthropicTextContent;

export interface AnthropicUserMessage {
  role: "user";
  content: AnthropicMessageContent[];
}

export interface AnthropicAssistantMessage {
  role: "assistant";
  content: AnthropicMessageContent[];
}

export type AnthropicMessage = AnthropicUserMessage | AnthropicAssistantMessage;

export interface AnthropicRequestBody {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: AnthropicMessage[];
}

// -----------------------------------
// OpenAI-specific types -------------
// -----------------------------------

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResponseFormat {
  type: "text" | "json_object";
}

export interface OpenAIRequestBody {
  model: string;
  response_format?: OpenAIResponseFormat;
  messages: OpenAIMessage[];
}

// -----------------------------------------------
// Common type for the return value of both APIs
// -----------------------------------------------

export interface llmOutputType {
  completion?: any;
  error?: Error;
  status: "success" | "failed";
  output?: string;
  usage?: any;
}
