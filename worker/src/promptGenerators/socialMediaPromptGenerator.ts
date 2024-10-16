// src/promptGenerators/socialMediaPromptGenerator.ts

import type { SubtypeSettings } from '../recipeTypes';
import type { UserInput } from '~/types/backendTypes';
import type { ContentTypeName } from '../../../types/contentTypes';
import { actionInstructionGenericSnippet, actionFieldsSnippet, contentTypeSnippet } from './SnippetsProcessors/actionProcessor';
import { examplesSnippet} from './SnippetsProcessors/exampleProcessor';
import { additionalInstructionsSnippet } from './SnippetsProcessors/additionalInstructionsProcessor';
import { systemPromptSnippet } from './SnippetsProcessors/systemPromptProcessor';
import { guidelinesSnippet } from './SnippetsProcessors/guidelineProcessor';
import { targetAudienceSnippet } from './SnippetsProcessors/targetAudienceProcessor';

// const productDescriptionSnippet = (projectSettings: UserInput): string =>
//   projectSettings.productDescription ? `<product_description>${projectSettings.productDescription}</product_description>` : '';

// const characterLimitSnippet = (projectSettings: UserInput, contentType: ContentTypeName): string =>
//   contentType === 'twitter_post' && typeof projectSettings.characterLimit === 'number'
//     ? `<character_limit>${projectSettings.characterLimit}</character_limit>`
//     : '';


const processedContextSnippet = (subtypeSettings: SubtypeSettings, projectSettings: UserInput): string =>
  subtypeSettings.context || projectSettings.context ? `<context>
  ${subtypeSettings.context ? `${subtypeSettings.context}\n` : ""}
  ${projectSettings.context ? `${projectSettings.context}\n` : ""}
  </context>` : '';


export function generateSystemPrompt(projectSettings: UserInput, contentType: ContentTypeName, outputType: string): string {
  return systemPromptSnippet(projectSettings, contentType, outputType);
}

export function generateUserContentPrompt(projectSettings: UserInput, subtypeSettings: SubtypeSettings, contentType: ContentTypeName): string {
  const snippets = [
    // --------- instruction snippets
    actionInstructionGenericSnippet(projectSettings, contentType),
    additionalInstructionsSnippet(subtypeSettings, projectSettings),
    // --------- enclosed fields in xml tags
    actionFieldsSnippet(projectSettings),
    // productDescriptionSnippet(projectSettings),
    targetAudienceSnippet(subtypeSettings, projectSettings),
    // characterLimitSnippet(projectSettings, contentType),
    guidelinesSnippet(subtypeSettings, projectSettings),
    processedContextSnippet(subtypeSettings, projectSettings),
    examplesSnippet(subtypeSettings),
    `Reply with only the ${contentTypeSnippet(contentType)}, no comment or intro.`
  ];

  const prompt = snippets.filter(Boolean).join('\n');
  console.log('---------------------\nUser content prompt:');
  console.log(prompt);
  return prompt;
}

export function generateRatingAndFeedbackPrompt(projectSettings: UserInput, subTypeSettings: SubtypeSettings, contentType: ContentTypeName, draftPost: string): string {
  // Generate the initial user prompt
  const initialPrompt = generateUserContentPrompt(projectSettings, subTypeSettings, contentType);
  const postType = contentTypeSnippet(contentType);

  const prompt = `
A writer was given this assignment:
<initial_assignment>${initialPrompt}</initial_assignment>

This is what he came up with:
<${postType}>${draftPost}</${postType}>

Your task is to:
1. provide detailed feedback
3. write 3 equally good, but significantly different, versions of the post, that follow your feedback

You should output your response in the following JSON format:
{
  "feedback": "Your feedback here",
  "options": {
    "1": "First version of the post",
    "2": "Second version of the post",
    "3": "Third version of the post"
  }
}

Provide your response in valid JSON format with properly escaped quotes and line breaks.
  `.trim();

  console.log('---------------------\nRating and feedback prompt:');
  console.log(prompt);
  return prompt;
}
