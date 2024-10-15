// src/recipes/blogPostOutlineRecipe.ts

import type { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';
import { generateSystemPrompt, generateUserContentPrompt, generateReviewPrompt } from '../promptGenerators/blogOutlinePromptGenerator';

type Config = ProjectSettings & {
  topic: string;
  targetAudience: string;
  outlineGuidelines: string;
  expertise?: string;
};

const OutputTypes = [
  'temp_topics',
  'temp_outline',
  'final_content'
] as const;

type OutputType = typeof OutputTypes[number];

const contentType = "blog_outline";

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: contentType,
  // componentType: "outline",
  outputTypes: OutputTypes,
  steps: [
    // {
    //   stepName: "Topic Research and Refinement",
    //   model: "claude-3-haiku-20240307",
    //   stepType: 'llm',
    //   outputType: 'temp_topics',
    //   systemPromptTemplate: (config) =>
    //     `You are an expert content strategist${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Here is a proposed topic for a blog post. Suggest the top 3 angles to explore. The format for your answer should be: "1. Angle 1, 2. Angle 2, 3. Angle 3." Each angle should be a concise phrase or sentence, not more than 10 words long.`,
    //   userContentTemplate: (_, config) =>
    //     `Topic: ${config.topic}\nTarget Audience: ${config.targetAudience}\n`
    // },
    {
      stepName: "Outline Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_outline',
      systemPromptTemplate: (config) =>generateSystemPrompt(config, contentType, 'temp_outline'),
      userContentTemplate: (_, config, subTypeSettings) => generateUserContentPrompt(config, subTypeSettings, contentType)
    },
    {
      stepName: "Outline Review",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_postOptions',
      systemPromptTemplate: (config) =>generateSystemPrompt(config, contentType, 'temp_postOptions'),
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
