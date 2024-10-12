// src/promptGenerators/socialMediaPromptGenerator.ts

import { ProjectSettings, SubtypeSettings } from '../recipeTypes';
import { ContentTypeName } from '@shared/contentTypes';

// System prompt snippets
const expertiseSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.expertise ? ` with deep knowledge in ${projectSettings.expertise}` : '';

const platformSnippet = (contentType: ContentTypeName): string =>
  contentType === 'linkedin_post' ? 'LinkedIn' : 'Twitter';

const contentTypeSnippet = (contentType: ContentTypeName): string =>
  contentType === 'linkedin_post' ? 'Linkedin Post' : 'Twitter Post';

// User content prompt snippets
const actionInstructionSnippet = (projectSettings: ProjectSettings, platform: string): string => {
  const actions = {
    write_topic: `Write a ${platform} post on the topic provided below`,
    promote_content: `Write a ${platform} post that promotes the content provided below`,
    repurpose_content: `Repurpose the content provided below into a ${platform} post`,
    promote_product: `Write a ${platform} post that subtly promotes the product described below`,
    default: `Write a ${platform} post`
  };

  let instruction = actions[projectSettings.action as keyof typeof actions] || actions.default;

  if (projectSettings.targetAudience) {
    instruction += `, optimized for the target audience`;
  }

  return instruction + '.';
};

// Preliminary instructions
const additionalInstructionsSnippet = (subtypeSettings: SubtypeSettings, projectSettings: ProjectSettings): string => {
  const elements = [];
  if (projectSettings.ideas) elements.push('ideas: make sure to include and develop them');
  if (subtypeSettings.guidelines || projectSettings.guidelines) elements.push('guidelines: make sure to follow them');
  if (subtypeSettings.goodExamples || projectSettings.goodExamples) elements.push('good examples: make sure to be consistent with them');
  if (subtypeSettings.badExamples || projectSettings.badExamples) elements.push('bad examples: identify what makes them bad and avoid this in your answer');

  if (elements.length === 0) return '';

  return `I have also included the following elements:
${elements.map(e => `- ${e}`).join('\n')}`;
};

const topicSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.topic ? `<topic>${projectSettings.topic}</topic>` : '';

const ideasSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.ideas ? `<ideas>${projectSettings.ideas}</ideas>\n` : '';

const contentSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.content ? `<content>${projectSettings.content}</content>` : '';

const productDescriptionSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.productDescription ? `<product_description>${projectSettings.productDescription}</product_description>` : '';

const targetAudienceSnippet = (projectSettings: ProjectSettings): string =>
  `<target_audience>${projectSettings.targetAudience}</target_audience>`;

const characterLimitSnippet = (projectSettings: ProjectSettings, contentType: ContentTypeName): string =>
  contentType === 'twitter_post' && typeof projectSettings.characterLimit === 'number'
    ? `<character_limit>${projectSettings.characterLimit}</character_limit>`
    : '';

const processedGuidelinesSnippet = (subtypeSettings: SubtypeSettings, projectSettings: ProjectSettings): string =>
  subtypeSettings.guidelines || projectSettings.guidelines ? `<guidelines>
  ${subtypeSettings.guidelines ? `${subtypeSettings.guidelines}\n` : ""}
  ${projectSettings.guidelines ? `${projectSettings.guidelines}\n` : ""}
  </guidelines>` : '';

const examplesSnippet = (subtypeSettings: SubtypeSettings): string => {
  if (!subtypeSettings.goodExamples && !subtypeSettings.badExamples) return '';
  const examples = `<examples>${subtypeSettings.goodExamples}\n${subtypeSettings.badExamples}</examples>`
  return examples;
};

export function generateSystemPrompt(projectSettings: ProjectSettings, contentType: ContentTypeName, outputType: string): string {
  const platform = platformSnippet(contentType);
  const role = outputType === "temp_draftPost" ? "writer" : outputType === "temp_postOptions" ? "editor" : "writer";
  const prompt = `You are an expert content ${role} for ${platform}${expertiseSnippet(projectSettings)}.`;
  console.log('---------------------\nSystem prompt:');
  console.log(prompt);
  return prompt;
}

export function generateUserContentPrompt(projectSettings: ProjectSettings, subtypeSettings: SubtypeSettings, contentType: ContentTypeName): string {
  const platform = platformSnippet(contentType);
  const snippets = [
    actionInstructionSnippet(projectSettings, platform),
    additionalInstructionsSnippet(subtypeSettings, projectSettings),
    topicSnippet(projectSettings),
    ideasSnippet(projectSettings),
    contentSnippet(projectSettings),
    productDescriptionSnippet(projectSettings),
    targetAudienceSnippet(projectSettings),
    characterLimitSnippet(projectSettings, contentType),
    processedGuidelinesSnippet(subtypeSettings, projectSettings),
    examplesSnippet(subtypeSettings),
    `Reply with only the ${platform === 'LinkedIn' ? 'post' : 'tweet'}, no comment or intro.`
  ];

  const prompt = snippets.filter(Boolean).join('\n');
  console.log('---------------------\nUser content prompt:');
  console.log(prompt);
  return prompt;
}

export function generateRatingAndFeedbackPrompt(projectSettings: ProjectSettings, subTypeSettings: SubtypeSettings, contentType: ContentTypeName, draftPost: string): string {
  // Generate the initial user prompt
  const initialPrompt = generateUserContentPrompt(projectSettings, subTypeSettings, contentType);
  const postType = contentTypeSnippet(contentType);

  const prompt = `
A writer was given this assignment:
<initial_user_prompt>${initialPrompt}</initial_user_prompt>

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
