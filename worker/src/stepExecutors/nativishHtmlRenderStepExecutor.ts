// src/stepExecutors/nativishHtmlRenderStepExecutor.ts

import type { NativishHtmlRenderStepConfig, ProjectSettings, StepResponse, SubtypeSettings } from '../recipeTypes';
import { diffWords } from 'diff';

export async function executeNativishHtmlRenderStep(
  stepConfig: NativishHtmlRenderStepConfig,
  content: Record<string, any>,
  recipeConfig: ProjectSettings,
  recipeData: SubtypeSettings
): Promise<StepResponse> {
  const { inputJsonKey } = stepConfig;
  const inputJson = content[inputJsonKey];

  if (!inputJson) {
    throw new Error(`Input JSON not found with key: ${inputJsonKey}`);
  }

  const { inputText, suggestion, explanation } = JSON.parse(inputJson);

  // Generate diff
  const diff = diffWords(inputText, suggestion);

  const inputTextHtml = diff.map(part => part.removed ? `<span class="removed">${part.value}</span>` : (part.added ? '' : part.value)).join('');
  const suggestionHtml = diff.map(part => part.added ? `<span class="added">${part.value}</span>` : (part.removed ? '' : part.value)).join('');

  const data = {
    inputTextHtml,
    suggestionHtml,
    inputTextLength: inputText.length,
    suggestionLength: suggestion.length,
    explanation
  };

  return {
    status: 'success',
    output: JSON.stringify(data),
    fullResponse: 'Nativish render data generated successfully',
  };
}
