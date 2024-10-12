// src/userInputProcessing.ts

import type { UserInput } from './recipeTypes';
import { loadRecipes } from './recipeLoader';
import { FileService } from './fileService';
import { getOutlineContent } from './contentOperations';
import * as userInputs from './userInputs';
import path from 'path';

const recipes = loadRecipes();

// Initialize FileService with the root directory
// Go up two levels from __dirname to reach the root directory
const rootDir = path.resolve(__dirname, '..', '..');

const fileService = new FileService(rootDir);

type UserInputType = {
  contentType: string;
  // componentType?: string;
  contentSubType: string;
  userID: number;
  config: any;
};

function gatherUserInput(): UserInputType {
  console.log('user input:', userInputs.userInput);
  return userInputs.userInput as UserInputType;
}

export async function getUserInputAndRecipe(): Promise<{
  userInput: UserInput<any>;
  recipe: any;
  contentType: string;
  // componentType: string;
  contentSubType: string;
  userID: number
}> {
  const userInput = gatherUserInput();
  const contentType = userInput.contentType;
  // const componentType = userInput.componentType || 'full_content';
  const contentSubType = userInput.contentSubType;
  const userID = userInput.userID;

  const recipe = recipes[contentType];

  if (!recipe) {
    throw new Error(`Unknown recipe: ${contentType}`);
  }

  // If contentExamplesFiles are provided, concatenate their contents
  if (userInput.config.contentExamplesFiles) {
    userInput.config.contentExamples = await fileService.concatenateContentExamples(userInput.config.contentExamplesFiles);
  }

  // If outline is provided as an ID, fetch the content
  if (userInput.config.outline && typeof userInput.config.outline === 'number') {
    userInput.config.outline_id = userInput.config.outline;
    userInput.config.outline = await getOutlineContent(userInput.config.outline);
  }

  return { userInput, recipe, contentType, contentSubType, userID };
}
