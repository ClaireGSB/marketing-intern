// src/recipes/blogPostFullContentRecipe.ts

import type { Recipe, SubtypeSettings } from '../recipeTypes';
import { generateSystemPrompt, generateUserContentPrompt, generateReviewPrompt } from '../promptGenerators/blogPostPromptGenerator';
import type { UserInput } from '~/types/backendTypes';


const OutputTypes = [
  'temp_draftPost',
  'final_content',
  'temp_title_options',
  'final_BM_title',
  'temp_metaDOptions',
  'temp_parsedMetaDOptions',
  'final_BM_meta_description',
] as const;

type OutputType = typeof OutputTypes[number];

const contentType = "blog_post";

const recipe: Recipe<UserInput, OutputType, SubtypeSettings> = {
  contentType: "blog_post",
  // componentType: "full_content",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "First Draft Generation",
      model: "claude-3-haiku-20240307",
      stepType: 'llm',
      outputType: 'temp_draftPost',
      systemPromptTemplate: (config) =>generateSystemPrompt(config, contentType, 'temp_draftPost'),
      userContentTemplate: (_, config, subTypeSettings) => generateUserContentPrompt(config, subTypeSettings, contentType)
    },
    {
      stepName: "Review and final polish",
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'temp_postOptions',
      systemPromptTemplate: (config) =>generateSystemPrompt(config, contentType, 'temp_postOptions'),
      userContentTemplate: (content, config, subTypeSettings) => generateReviewPrompt(
        config,
        subTypeSettings,
        contentType,
        content.temp_draftPost
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
        Post: ${content.temp_draftPost}\nTarget Audience: ${config.targetAudience}
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
      outputType: 'temp_parsedTitle_options',
    },
    {
      stepName: "User Approval",
      stepType: 'userValidation',
      outputType: 'final_BM_title',
      options: (content) => content.temp_parsedTitle_options?.options || {},
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
        Post: ${content.temp_draftPost}\nTarget Audience: ${config.targetAudience}
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
