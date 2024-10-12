// src/llm.ts

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";
import {
  AnthropicUserMessage,
  AnthropicAssistantMessage,
  AnthropicMessage,
  AnthropicRequestBody,
  AnthropicMessageContent,
  OpenAIMessage,
  OpenAIRequestBody,
  OpenAIResponseFormat,
  llmOutputType
} from './llmTypes';

const openai = new OpenAI();
const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

// Define a type for the function signature
type FetchCompletionFunction = (model: string, systemPrompt: string, userContent: string, outputJSON?: boolean, temperature?: number) => Promise<llmOutputType>;

// Add an index signature to the modelFunctions object
const modelFunctions: { [key: string]: FetchCompletionFunction } = {
  "gpt-4o-mini": fetchOpenAICompletion,
  "gpt-4o-2024-08-06": fetchOpenAICompletion,
  "claude-3-5-sonnet-20240620": fetchClaudeCompletion,
  "claude-3-haiku-20240307": fetchClaudeCompletion,
};

// -------------------------------
// OpenAI 
// -------------------------------

function prepareOpenAIRequestBody(model: string, systemPrompt: string, userContent: string, outputJSON?: boolean, temperature?: number): OpenAIRequestBody {
  let messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  const requestBody: OpenAIRequestBody = {
    model: model,
    messages: messages,
  };

  if (outputJSON) {
    requestBody.response_format = { type: "json_object" } as OpenAIResponseFormat;
  }

  if (temperature) {
    // requestBody.temperature = temperature;
    // weird this causes an error///
  }

  return requestBody;
}

async function fetchOpenAICompletion(model: string, systemPrompt: string, userContent: string, outputJSON?: boolean, temperature?: number): Promise<llmOutputType> {
  try {
    const requestBody = prepareOpenAIRequestBody(model, systemPrompt, userContent, outputJSON);
    const completion = await openai.chat.completions.create(requestBody);

    return {
      completion: completion,
      output: completion.choices[0].message.content || "",
      usage: completion.usage,
      status: "success",
    }
  } catch (error) {
    console.error("Failed to fetch completion: ", error);
    return {
      error: error instanceof Error ? error : new Error(String(error)),
      status: "failed",
    };
  }
}

// -------------------------------
// ANTHROPIC 
// -------------------------------

function prepareAnthropicRequestBody(model: string, systemPrompt: string, userContent: string, outputJSON?: boolean, temperature?: number): AnthropicRequestBody {
  let messages: AnthropicMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: userContent,
        } as AnthropicMessageContent
      ],
    } as AnthropicUserMessage
  ];

  if (outputJSON) {
    messages.push({
      role: "assistant",
      content: [{ type: "text", text: "{" } as AnthropicMessageContent],
    } as AnthropicAssistantMessage);
  }

  let temperatureValue = 0;

  if (temperature) {
    temperatureValue = temperature;
  }

  return {
    model: model,
    max_tokens: 4096,
    temperature: temperatureValue,
    system: systemPrompt,
    messages: messages,
  };
}

async function fetchClaudeCompletion(model: string, systemPrompt: string, userContent: string, outputJSON?: boolean, temperature?: number): Promise<llmOutputType> {
  try {
    const requestBody = prepareAnthropicRequestBody(model, systemPrompt, userContent, outputJSON, temperature);
    const completion = await anthropic.messages.create(requestBody as any);

    let output = completion.content[0].type === "text" ? completion.content[0].text : "";
    if (outputJSON) {
      // add '{' to the beginning of the output since we "prefilled" it in the request
      output = "{" + output;
    }

    return {
      completion: completion,
      output: output,
      usage: completion.usage,
      status: "success",
    };
  } catch (error) {
    console.error("Failed to fetch completion: ", error);
    return {
      error: error instanceof Error ? error : new Error(String(error)),
      status: "failed",
    };
  }
}

// -------------------------------
// Fetch completion 
// -------------------------------

export async function fetchCompletion(model: string, systemPrompt: string, userContent: string, outputJSON?: boolean, temperature?: number): Promise<llmOutputType> {
  return modelFunctions[model](model, systemPrompt, userContent, outputJSON, temperature);
}
