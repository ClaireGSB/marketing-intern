// src/recipes/blogPostFullContentRecipe.ts

import type { Recipe, SubtypeSettings } from '../recipeTypes';
import { generateSystemPrompt, generateUserContentPrompt, generateReviewPrompt, generateTitlePrompt, generateMetadescriptionPrompt } from '../promptGenerators/blogPostPromptGenerator';
import type { UserInput } from '~/types/backendTypes';


const OutputTypes = [
  'temp_draftPost',
  'final_content',
  'temp_title',
  'final_BM_title',
  'temp_metaDescription',
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
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_draftPost'),
      userContentTemplate: (_, config, subTypeSettings) => generateUserContentPrompt(config, subTypeSettings, contentType)
    },
    {
      stepName: "Review and final polish",
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'temp_postOptions',
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_postOptions'),
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
      outputType: 'temp_title',
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_title'),
      userContentTemplate: (content, config, subTypeSettings) => generateTitlePrompt(config, subTypeSettings, contentType, content.temp_draftPost)
    },
    {
      stepName: "Parse JSON Output",
      stepType: 'jsonParse',
      inputKey: 'temp_title',
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
      outputType: 'temp_metaDescription',
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_metaDescription'),
      userContentTemplate: (content, config, subTypeSettings) => generateMetadescriptionPrompt(config, subTypeSettings, contentType, content.temp_draftPost)
    },
    {
      stepName: "Parse JSON Output",
      stepType: 'jsonParse',
      outputType: 'temp_parsedMetaDOptions',
      inputKey: 'temp_metaDescription'
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
