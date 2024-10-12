// src/recipes/blogPostOutlineRecipe.ts

import { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';

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

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: "blog_post_outline",
  // componentType: "outline",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "Topic Research and Refinement",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_topics',
      systemPromptTemplate: (config) =>
        `You are an expert content strategist${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Here is a proposed topic for a blog post. Suggest the top 3 angles to explore. The format for your answer should be: "1. Angle 1, 2. Angle 2, 3. Angle 3." Each angle should be a concise phrase or sentence, not more than 10 words long.`,
      userContentTemplate: (_, config) =>
        `Topic: ${config.topic}\nTarget Audience: ${config.targetAudience}\n`
    },
    {
      stepName: "Outline Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_outline',
      systemPromptTemplate: (config) =>
        `You are an expert content outliner${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Create a detailed outline with main sections and subsections based on the provided topic and important angles to explore. The angles to explore need to be included in the post but they are not necessarily the main sections. Reply with the outline only, no comment or explanation needed.`,
      userContentTemplate: (content, config) =>
        `Topic: ${config.topic}\nAngles to explore: ${content.temp_topics}\nTarget Audience: ${config.targetAudience}\nGuidelines: ${config.outlineGuidelines}`
    },
    {
      stepName: "Outline Review",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'final_content',
      systemPromptTemplate: (config) =>
        `You are an expert content writer${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Review the outline and suggest any changes or improvements. Ensure that the outline is clear, logical, and follows the guidelines provided. Reply with a revised outline.`,
      userContentTemplate: (content, config) =>
        `Outline: ${content.temp_outline}\nGuidelines: ${config.outlineGuidelines}\nTarget Audience: ${config.targetAudience}`
    }
  ]
};

export default recipe;
