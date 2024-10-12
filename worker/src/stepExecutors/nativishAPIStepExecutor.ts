// src/stepExecutors/nativishApiStepExecutor.ts

import type { NativishAPIStepConfig, ProjectSettings, StepResponse, SubtypeSettings } from '../recipeTypes';
import { config } from '../config';
import markdownit from 'markdown-it';

interface NativishAPIResponse {
  id: string;
  status: 'pending' | 'completed';
  improved?: string;
  explanation?: string;
  error?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function pollForImprovement(
  improveUrl: string,
  improvedTextId: string,
  authToken: string
): Promise<NativishAPIResponse> {
  console.log('Polling for improvement');
  const response = await fetch(`${improveUrl}/${improvedTextId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: NativishAPIResponse = await response.json() as NativishAPIResponse;

  if (data.status === 'completed') {
    return data;
  } else if (data.status === 'pending') {
    await sleep(500);
    return pollForImprovement(improveUrl, improvedTextId, authToken);
  } else {
    throw new Error(`Unexpected status: ${data.status}`);
  }
}

export async function executeNativishApiStep(
  stepConfig: NativishAPIStepConfig,
  content: Record<string, any>,
  projectSettings: ProjectSettings,
  recipeData: SubtypeSettings
): Promise<StepResponse> {
  try {
    console.log('Executing Nativish API step');
    const apiRoot = config.nativishApiUrl;
    const authToken = config.nativishAuthToken;
    const inputText = stepConfig.inputText(projectSettings);
    const improveUrl = `${apiRoot}/improvements`;

    const initResponse = await fetch(improveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ "input_text": inputText, "source": "web" })
    });

    if (!initResponse.ok) {
      console.log(initResponse);
      throw new Error(`HTTP error! status: ${initResponse.status}`);
    }

    const initData: { id: string } = await initResponse.json() as { id: string };
    const result = await pollForImprovement(improveUrl, initData.id, authToken);

    if (result.error) {
      console.log(result.error);
      throw new Error(result.error);
    }

    console.log(result);

    const md = markdownit()
    const explanationMarkdown = md.render(result.explanation || "");

    const outputJSON = JSON.stringify({
      inputText: inputText,
      suggestion: result.improved,
      explanation: explanationMarkdown
    });

    return {
      status: 'success',
      fullResponse: result,
      output: outputJSON,
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
