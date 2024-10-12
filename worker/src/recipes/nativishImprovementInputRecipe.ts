// src/recipes/nativishImprovementInputRecipe.ts

// ------------------------------------------------------------
// This recipe generates examples incorrect sentences with mistakes on a given topic (provided by the user)
// Step 1: run the input text through the LLM model to generate examples of common mistakes
// ------------------------------------------------------------

import { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';
import path from 'path';

// Config defines the inputs to the recipe
type Config = ProjectSettings & {
  topic: string;
  language?: string;
};

// OutputTypes define the possible output types for each steps, this is where the output of each step is stored
const OutputTypes = [
  'apiOutput',
  'renderData',
  'screenshotPath'
] as const;

type OutputType = typeof OutputTypes[number];

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: "nativish_input_text",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "Example Generation",
      model: "claude-3-haiku-20240307",
      // model: "claude-3-5-sonnet-20240620",
      // model: "gpt-4o-mini",
      // model: "gpt-4o-2024-08-06",
      temperature: 0.8,
      stepType: 'llm',
      outputType: 'examples',
      outputJSON: true,
      systemPromptTemplate: (config) =>
        `You are a expert linguist and language teacher${config.language ? `in ${config.language}.` : '. You have a deep understanding of all languages in the world.'}`,
      userContentTemplate: (_, config) =>
        `This is a common area where ${config.language ? `${config.language}` : ''} language learners make mistakes: ${config.topic} . Your task is to generate 3 examples illustrating the mistake.
        You should output your response in the following JSON format:
        {
          1: {
            "incorrect": "Incorrect sentence 1",
            "correct": "Correct sentence 1"}
            },
          2: {
            "incorrect": "Incorrect sentence 2",
            "correct": "Correct sentence 2"}
            },
        ...
        }`
    },
  ]
};


export default recipe;
