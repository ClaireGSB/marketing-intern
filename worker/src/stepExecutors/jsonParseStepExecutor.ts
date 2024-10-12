// src/stepExecutors/jsonParseStepExecutor.ts

import type { JSONParseStepConfig, StepResponse, ProjectSettings, SubtypeSettings } from '../recipeTypes';

function sanitizeJSON(input: string): string {
  // Replace newlines within string values with \n
  let sanitized = input.replace(/("(?:\\.|[^"\\])*")/g, (match) => {
    return match.replace(/[\n\r]/g, '\\n');
  });

  // Quote unquoted property names
  sanitized = sanitized.replace(/(\s*)([\w]+)\s*:/g, '$1"$2":');

  // Replace single quotes with double quotes, but only if they're not within a string
  sanitized = sanitized.replace(/(?<!\\)'/g, '"');

  // Add missing commas between properties
  sanitized = sanitized.replace(/}(\s*"){/g, '},$1{');

  // Remove any trailing commas before closing braces or brackets
  sanitized = sanitized.replace(/,(\s*[}\]])/g, '$1');

  return sanitized;
}

export async function executeJSONParseStep(
  stepConfig: JSONParseStepConfig,
  content: any,
  recipeConfig: ProjectSettings,
  recipeData: SubtypeSettings
): Promise<StepResponse> {
  try {
    const inputContent = content[stepConfig.inputKey];
    let parsedContent;

    if (typeof inputContent === 'string') {
      try {
        parsedContent = JSON.parse(inputContent);
      } catch (parseError) {
        // try sanitizing the input and parsing again
        const sanitizedInput = sanitizeJSON(inputContent);
        try {
          parsedContent = JSON.parse(sanitizedInput);
        } catch (sanitizedParseError) {
          console.error('Error parsing JSON after sanitization:', sanitizedParseError);
          console.log('Problematic JSON string:', sanitizedInput);
          throw sanitizedParseError;
        }
      }
    } else if (typeof inputContent === 'object' && inputContent !== null) {
      // If it's already an object, we don't need to parse it
      parsedContent = inputContent;
    } else {
      throw new Error('Invalid input for JSON parsing');
    }

    return {
      status: 'success',
      output: parsedContent,
      fullResponse: parsedContent
    };
  } catch (error) {
    console.error('Error in JSON parsing:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
