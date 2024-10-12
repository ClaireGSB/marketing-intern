// src/recipes/blogPostRecipe.ts

import { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';

// Config defines the inputs to the recipe
type Config = ProjectSettings & {
  topic: string;
  targetAudience: string;
  outlineGuidelines: string;
  copyGuidelines: string;
  formattingGuidelines?: string;
  expertise?: string;
  userProvidedAngles?: string;
};

// OutputTypes define the possible output types for each steps, this is where the output of each step is stored
const OutputTypes = [
  'topics',
  'outline',
  'body',
  'titleOptions',
  'metaDescription',
  'formattedPost'
] as const;

type OutputType = typeof OutputTypes[number];
// this is equivalent to: type BlogOutputType = 'topics' | 'outline' | 'body' | 'titleOptions' | 'metaDescription' | 'formattedPost';

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: "blog_post_old",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "Topic Research and Refinement",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'topics',
      condition: (config) => !config.userProvidedAngles || config.userProvidedAngles.length === 0,
      fallbackValue: (config) => config.userProvidedAngles || '',
      systemPromptTemplate: (config) =>
        `You are an expert content strategist${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Here is a proposed topic for a blog post. Suggest the top 3 angles to explore. The format for your answer should be: "1. Angle 1, 2. Angle 2, 3. Angle 3." Each angle should be a concise phrase or sentence, not more than 10 words long.`,
      userContentTemplate: (_, config) =>
        `Topic: ${config.topic}\nTarget Audience: ${config.targetAudience}\n`
    },
    {
      stepName: "Outline Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'outline',
      systemPromptTemplate: (config) =>
        `You are an expert content outliner${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Create a detailed outline with main sections and subsections based on the provided topic and important angles to explore. The angles to explore need to be included in the post but they are not necessarily the main sections. Reply with the outline only, no comment or explanation needed.`,
      userContentTemplate: (content, config) =>
        `Topic: ${config.topic}\nAngles to explore: ${content.topics}\nTarget Audience: ${config.targetAudience}\nGuidelines: ${config.outlineGuidelines}`
    },
    {
      stepName: "Outline Review",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'outline',
      systemPromptTemplate: (config) =>
        `You are an expert content writer${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Review the outline and suggest any changes or improvements. Ensure that the outline is clear, logical, and follows the guidelines provided. If the outline is good as is, reply with "GREAT".`,
      userContentTemplate: (content, config) =>
        `Outline: ${content.outline}\nGuidelines: ${config.outlineGuidelines}\nTarget Audience: ${config.targetAudience}`
    },
    {
      stepName: "First Draft Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'body',
      systemPromptTemplate: (config) =>
        `You are an expert content writer${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Write a blog post based on the outline, guidelines, and target audience provided. Ensure that the content is engaging, informative, and follows the outline closely. The post should be well-structured with clear headings in markdown. Only use subheadings if necessary / if the content for that section is long enough. Do not include headings or subheadings for the introduction and conclusion. Do not include a title for the post. Reply with the post only, no comment or explanation needed.`,
      userContentTemplate: (content, config) =>
        `Outline: ${content.outline}\nGuidelines: ${config.copyGuidelines}\nTarget Audience: ${config.targetAudience}`
    },
    {
      stepName: "Final polish",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'body',
      systemPromptTemplate: (config) =>
        `You are an expert editor${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Review the blog post and suggest any final changes or improvements. Ensure that the post is well-written, engaging for the target audience, and follows the guidelines provided. If the post is good as is, reply with "GREAT".Otherwise, make the necessary changes and reply with the final polished post. Do not include a title for the post.`,
      userContentTemplate: (content, config) =>
        `Post: ${content.body}\nGuidelines: ${config.copyGuidelines}\nTarget Audience: ${config.targetAudience}`
    },
    {
      stepName: "Headline Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'titleOptions',
      systemPromptTemplate: (config) =>
        `You are a headline expert${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Write 5 different headlines for the blog post. Each headline should be engaging, informative, and tailored to the target audience. The headlines should be concise and no more than 10 words long. Reply with the headlines only, in this format: "1. Headline 1, 2. Headline 2, 3. Headline 3, 4. Headline 4, 5. Headline 5."`,
      userContentTemplate: (content, config) =>
        `Post: ${content.body}\nTarget Audience: ${config.targetAudience}`
    },
    {
      stepName: "Meta Description Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'metaDescription',
      systemPromptTemplate: (config) =>
        `You are an SEO expert${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Write a meta description for the blog post. The meta description should be concise, engaging, and informative. It should accurately summarize the content of the post and entice readers to click. The meta description should be no more than 155 characters long. Reply with the meta description only.`,
      userContentTemplate: (content, config) =>
        `Post: ${content.body}\nTarget Audience: ${config.targetAudience}`
    },
    {
      stepName: "Formatting",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'formattedPost',
      systemPromptTemplate: (config) =>
        `You are a blog publisher${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Format the blog post for publishing based on the formatting guidelines provided.`,
      userContentTemplate: (content, config) =>
        `Post: ${content.body}\nTitle Options: ${content.titleOptions}\nMeta Description: ${content.metaDescription}\nFormatting Guidelines: ${config.formattingGuidelines}`
    }
  ]
};

export default recipe;
