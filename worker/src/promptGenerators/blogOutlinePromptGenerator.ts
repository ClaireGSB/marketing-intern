// src/promptGenerators/blog OutlinePromptGenerator.ts

import type { SubtypeSettings } from '../recipeTypes';
import type { UserInput } from '~/types/backendTypes';
import type { ContentTypeName } from '../../../types/contentTypes';
import { actionInstructionBlogOutlineSnippet, actionFieldsSnippet, contentTypeSnippet } from './SnippetsProcessors/actionProcessor';
import { examplesSnippet } from './SnippetsProcessors/exampleProcessor';
import { additionalInstructionsSnippet } from './SnippetsProcessors/additionalInstructionsProcessor';
import { systemPromptSnippet } from './SnippetsProcessors/systemPromptProcessor';
import { guidelinesSnippet } from './SnippetsProcessors/guidelineProcessor';
import { targetAudienceSnippet } from './SnippetsProcessors/targetAudienceProcessor';
import { contextSnippet } from './SnippetsProcessors/contextProcessor';
import { seoPhraseSnippet } from './SnippetsProcessors/seoPhraseProcessor';

export function generateSystemPrompt(projectSettings: UserInput, contentType: ContentTypeName, outputType: string): string {
  return systemPromptSnippet(projectSettings, contentType, outputType);
}

export function generateUserContentPrompt(projectSettings: UserInput, subtypeSettings: SubtypeSettings, contentType: ContentTypeName): string {
  const snippets = [
    // --------- instruction snippets
    actionInstructionBlogOutlineSnippet(projectSettings, contentType),
    additionalInstructionsSnippet(subtypeSettings, projectSettings, contentType),
    // --------- enclosed fields in xml tags
    actionFieldsSnippet(projectSettings),
    // productDescriptionSnippet(projectSettings),
    targetAudienceSnippet(subtypeSettings, projectSettings),
    // characterLimitSnippet(projectSettings, contentType),
    seoPhraseSnippet(projectSettings),
    guidelinesSnippet(subtypeSettings, projectSettings),
    contextSnippet(subtypeSettings, projectSettings),
    examplesSnippet(subtypeSettings),
  ];

  const prompt = snippets.filter(Boolean).join('\n');
  console.log('---------------------\nUser content prompt:');
  console.log(prompt);
  return prompt;
}

export function generateReviewPrompt(projectSettings: UserInput, subTypeSettings: SubtypeSettings, contentType: ContentTypeName, draftPost: string): string {
  // Generate the initial user prompt
  const initialPrompt = generateUserContentPrompt(projectSettings, subTypeSettings, contentType);

  const prompt = `
A writer was given this assignment:
<initial_assignment>${initialPrompt}</initial_assignment>

This is what he came up with:
<outline>${draftPost}</outline>

Your task is
1. review the outline and suggest any changes or improvements. Ensure that the outline is clear, logical, and follows the guidelines provided.
2. write 2 equally good, but significantly different, (the structure needs to be different, not just the words) versions of the outline, that follow your feedback.
You should output your response in the following JSON format:
{
  "options": {
    "1": "First version of the outline",
    "2": "Second version of the outline",
  }
}
  Provide your response in valid JSON format with properly escaped quotes and line breaks.
`

    ;
  console.log('---------------------\nReview prompt:');
  console.log(prompt);
  return prompt;
}
