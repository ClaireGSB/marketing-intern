// src/recipes/blogPostFullContentRecipe.ts

import type { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';

type Config = ProjectSettings & {
  topic: string;
  targetAudience: string;
  copyGuidelines: string;
  formattingGuidelines?: string;
  expertise?: string;
  outline: string | number;
};

const OutputTypes = [
  'temp_draftBody',
  'final_content',
  'temp_title_options',
  'final_BM_title_options',
  'final_BM_title',
  'temp_metaDOptions',
  'temp_parsedMetaDOptions',
  'final_BM_meta_description',
] as const;

type OutputType = typeof OutputTypes[number];

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: "blog_post_copy",
  // componentType: "full_content",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "First Draft Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_draftBody',
      systemPromptTemplate: (config) =>
        `You are an expert content writer${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Write a blog post based on the outline, guidelines, and target audience provided. Ensure that the content is engaging, informative, and follows the outline closely. The post should be well-structured with clear headings in markdown. Only use subheadings if necessary / if the content for that section is long enough. Do not include headings or subheadings for the introduction and conclusion. Do not include a title for the post. Reply with the post only, no comment or explanation needed.`,
      userContentTemplate: (_, config) =>
        `Outline: ${config.outline}\nGuidelines: ${config.copyGuidelines}\nTarget Audience: ${config.targetAudience}`
    },
    {
      stepName: "Final polish",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'final_content',
      systemPromptTemplate: (config) =>
        `You are an expert editor${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Review the blog post and rewrite it to make it better. Ensure that the post is well-written, engaging for the target audience, and follows the guidelines provided.Reply with the final polished post. Do not include a title for the post.`,
      userContentTemplate: (content, config) =>
        `Post: ${content.temp_draftBody}\nGuidelines: ${config.copyGuidelines}\nTarget Audience: ${config.targetAudience}`
    },
    {
      stepName: "Headline Generation",
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'temp_title_options',
      systemPromptTemplate: (config) =>
        `You are a headline expert${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}.`,
      userContentTemplate: (content, config) =>
        ` Write 2 different headlines for the blog post. Each headline should be engaging, informative, and tailored to the target audience. The headlines should be concise and no more than 10 words long."
        Post: ${content.final_content}\nTarget Audience: ${config.targetAudience}
        You should output your response in the following JSON format:
      {
        options: {
          "1": "First version",
          "2": "Second version",
        }
      }
      Provide your response in valid JSON format with properly escaped quotes and line breaks.`
    },
    {
      stepName: "Parse JSON Output",
      stepType: 'jsonParse',
      inputKey: 'temp_title_options',
      outputType: 'final_BM_title_options',
    },
    {
      stepName: "User Approval",
      stepType: 'userValidation',
      outputType: 'final_BM_title',
      options: (content) => content.final_BM_title_options?.options || {},
    },
    {
      stepName: "Meta Description Generation",
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'temp_metaDOptions',
      systemPromptTemplate: (config) =>
        `You are an SEO expert${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Write a meta description for the blog post. The meta description should be concise, engaging, and informative. It should accurately summarize the content of the post and entice readers to click. The meta description should be no more than 155 characters long. Reply with the meta description only.`,
      userContentTemplate: (content, config) =>
        `Write 2 options of meta description for the blog post. The meta description should be concise, engaging, and informative. It should accurately summarize the content of the post and entice readers to click. The meta description should be no more than 155 characters long.
        Post: ${content.final_content}\nTarget Audience: ${config.targetAudience}
        You should output your response in the following JSON format:
      {
        options: {
          "1": "First version",
          "2": "Second version"
        }
      }
      Provide your response in valid JSON format with properly escaped quotes and line breaks.`
    },
    {
      stepName: "Parse JSON Output",
      stepType: 'jsonParse',
      outputType: 'temp_parsedMetaDOptions',
      inputKey: 'temp_metaDOptions'
    },
    {
      stepName: "User Approval",
      stepType: 'userValidation',
      outputType: 'final_BM_meta_description',
      options: (content) => content.temp_parsedMetaDOptions?.options || {},
    }
    // {
    //   stepName: "Formatting",
    //   model: "claude-3-haiku-20240307",
    //   stepType: 'llm',
    //   outputType: 'final_BM_formatted_post',
    //   systemPromptTemplate: (config) =>
    //     `You are a blog publisher${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. Format the blog post for publishing based on the formatting guidelines provided.`,
    //   userContentTemplate: (content, config) =>
    //     `Post: ${content.final_content}\nTitle Options: ${content.titleOptions}\nMeta Description: ${content.metaDescription}\nFormatting Guidelines: ${config.formattingGuidelines}`
    // }
  ]
};

export default recipe;
