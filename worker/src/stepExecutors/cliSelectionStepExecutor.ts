// src/stepExecutors/cliSelectionStepExecutor.ts

import readline from 'readline';
import type { CLISelectionStepConfig, StepResponse, ProjectSettings, SubtypeSettings } from '../recipeTypes';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

export async function executeCLISelectionStep(
  stepConfig: CLISelectionStepConfig,
  content: any,
  recipeConfig: ProjectSettings,
  recipeData: SubtypeSettings
): Promise<StepResponse> {
  try {
    const options = stepConfig.options(content);
    const promptText = stepConfig.promptText || "Please select an option:";

    let prompt = `${promptText}\n\n----------------------------------------\n\n`;
    Object.entries(options).forEach(([key, value]) => {
      prompt += `${key}.\n${value || `Option ${key} not available`}\n\n`;
      prompt += '----------------------------------------\n\n';
    });
    prompt += `Enter a number between 1 and ${Object.keys(options).length}, or 's' to skip validation: `;

    let answer = await askQuestion(prompt);
    const validAnswers = [...Object.keys(options), 's'];

    while (!validAnswers.includes(answer)) {
      console.log(`Invalid input. Please enter a number between 1 and ${Object.keys(options).length}, or 's' to skip validation.`);
      answer = await askQuestion(prompt);
    }

    if (answer === 's') {
      return {
        status: 'success',
        output: 'PENDING_VALIDATION',
        fullResponse: {
          pendingValidation: true,
          options: options
        }
      };
    }

    const selectedOption = options[answer];

    if (!selectedOption) {
      throw new Error(`Selected option (${answer}) is not available.`);
    }

    let explanation = '';
    if (stepConfig.followUpPrompt) {
      const followUpAnswer = await askQuestion(stepConfig.followUpPrompt + "\n");
      if (followUpAnswer.trim() !== '') {
        explanation = followUpAnswer;
      }
    }

    return {
      status: 'success',
      output: selectedOption,
      fullResponse: {
        selectedOption,
        selectedKey: answer,
        explanation
      }
    };
  } catch (error) {
    console.error("Error in CLI step:", error);
    return {
      status: 'failed',
      error: error instanceof Error ? error : new Error(String(error))
    };
  } finally {
    rl.close();
  }
}
