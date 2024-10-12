// src/stepExecutors/llmStepExecutor.ts

import { fetchCompletion } from "../llm";
import type { LLMStepConfig, ProjectSettings, SubtypeSettings, StepResponse, TokenUsage } from '../recipeTypes';

export async function executeLLMStep(
  stepConfig: LLMStepConfig,
  content: any,
  recipeConfig: ProjectSettings,
  recipeData: SubtypeSettings
): Promise<StepResponse & { tokenUsage?: TokenUsage }> {
  const systemPrompt = stepConfig.systemPromptTemplate(recipeConfig, recipeData);
  const userContent = stepConfig.userContentTemplate(content, recipeConfig, recipeData);
  const response = await fetchCompletion(stepConfig.model, systemPrompt, userContent, stepConfig.outputJSON, stepConfig.temperature);
  let tokenUsage: TokenUsage | undefined;

  if (response.status === 'success' && response.completion && response.completion.usage) {
    const usage = response.completion.usage;
    // helper function to get token count from usage object given the possible keys
    const getTokenCount = (keys: string[]): number => {
      for (const key of keys) {
        if (key in usage) {
          return usage[key];
        }
      }
      console.warn(`Token count not found for ${keys.join(' or ')}. Using fallback value of 0.`);
      return 0;
    };
    tokenUsage = {
      model: stepConfig.model,
      input_tokens: getTokenCount(['input_tokens', 'prompt_tokens']),
      output_tokens: getTokenCount(['output_tokens', 'completion_tokens'])
    };
  } else {
    console.warn('Usage information not found in LLM response. Using fallback values of 0 for token counts.');
    tokenUsage = {
      model: stepConfig.model,
      input_tokens: 0,
      output_tokens: 0
    };
  }

  return {
    status: response.status,
    error: response.error,
    fullResponse: response.completion,
    output: response.output,
    tokenUsage
  };
}
