// src/promptGenerators/blog OutlinePromptGenerator.ts

import type { SubtypeSettings } from '../recipeTypes';
import type { UserInput } from '~/types/backendTypes';
import type { ContentTypeName } from '../../../types/contentTypes';
import { actionInstructionBlogCopySnippet, actionFieldsSnippet, contentTypeSnippet } from './SnippetsProcessors/actionProcessor';
import { examplesSnippet} from './SnippetsProcessors/exampleProcessor';
import { additionalInstructionsSnippet } from './SnippetsProcessors/additionalInstructionsProcessor';
import { systemPromptSnippet } from './SnippetsProcessors/systemPromptProcessor';
import { guidelinesSnippet } from './SnippetsProcessors/guidelineProcessor';
import { targetAudienceSnippet } from './SnippetsProcessors/targetAudienceProcessor';
import { contextSnippet } from './SnippetsProcessors/contextProcessor';
import { seoPhraseSnippet } from './SnippetsProcessors/seoPhraseProcessor';
import { outlineSnippet } from './SnippetsProcessors/OutlineProcessor';

export function generateSystemPrompt(projectSettings: UserInput, contentType: ContentTypeName, outputType: string): string {
  return systemPromptSnippet(projectSettings, contentType, outputType);
}


export function generateUserContentPrompt(projectSettings: UserInput, subtypeSettings: SubtypeSettings, contentType: ContentTypeName): string {
  const snippets = [
    // --------- instruction snippets
    actionInstructionBlogCopySnippet(projectSettings, contentType),
    additionalInstructionsSnippet(subtypeSettings, projectSettings),
    // --------- enclosed fields in xml tags
    outlineSnippet(projectSettings),
    actionFieldsSnippet(projectSettings),
    seoPhraseSnippet(projectSettings),
    targetAudienceSnippet(subtypeSettings, projectSettings),
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
<blog post>${draftPost}</blog post>

Your task is
1. review the blog post and identify any changes or improvements needed
2. write 2 equally good, but significantly different, versions of the post (making sure to follow the outline and the initial assignment), that follow your analysis in (1).
You should output your response in the following JSON format:
{
  "options": {
    "1": "First version of the post",
    "2": "Second version of the post",
  }
}
  Provide your response in valid JSON format with properly escaped quotes and line breaks. ONLY respond with the JSON, not your analysis.
`

;
  console.log('---------------------\nReview prompt:');
  console.log(prompt);
  return prompt;
}
