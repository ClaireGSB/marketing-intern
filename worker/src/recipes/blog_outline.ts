// src/recipes/blogPostOutlineRecipe.ts

import type { Recipe, SubtypeSettings } from '../recipeTypes';
import { generateSystemPrompt, generateUserContentPrompt, generateReviewPrompt } from '../promptGenerators/blogOutlinePromptGenerator';
import type { UserInput } from '~/types/backendTypes';


const OutputTypes = [
  'temp_topics',
  'temp_outline',
  'final_content'
] as const;

type OutputType = typeof OutputTypes[number];

const contentType = "blog_outline";

const recipe: Recipe<UserInput, OutputType, SubtypeSettings> = {
  contentType: contentType,
  // componentType: "outline",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "Outline Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_outline',
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_outline'),
      userContentTemplate: (_, config, subTypeSettings) => generateUserContentPrompt(config, subTypeSettings, contentType)
    },
    {
      stepName: "Outline Review",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_postOptions',
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_postOptions'),
      userContentTemplate: (content, config, subTypeSettings) => generateReviewPrompt(
        config,
        subTypeSettings,
        contentType,
        content.temp_outline
      )
    },
    {
      stepName: "Parse JSON Output",
      stepType: 'jsonParse',
      inputKey: 'temp_postOptions',
      outputType: 'temp_parsedPostOptions',
    },
    {
      stepName: "User Approval",
      stepType: 'userValidation',
      outputType: 'final_content',
      options: (content) => content.temp_parsedPostOptions?.options || {},
    }
  ]
};

export default recipe;
