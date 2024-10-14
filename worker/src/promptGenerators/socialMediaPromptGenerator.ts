// src/promptGenerators/socialMediaPromptGenerator.ts

import type { ProjectSettings, SubtypeSettings } from '../recipeTypes';
import type { ContentTypeName } from '../../../types/contentTypes';
import { processBadExamples, processGoodExamples } from '../dataProcessors/exampleProcessor';

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
    repurpose_content: `Repurpose the content provided below, based on the repurposing instructions, into a ${platform} post`,
    promote_product: `Write a ${platform} post that subtly promotes the product described below`,
    default: `Write a ${platform} post`
  };

  let instruction = actions[projectSettings.action as keyof typeof actions] || actions.default;

  if (projectSettings.targetAudience) {
    instruction += `, optimized for the target audience`;
  }

  return instruction + '.';
};

// Process examples
let goodExamples = ''
let badExamples = ''

function processExamples(subtypeSettings: SubtypeSettings) {
  if (subtypeSettings.examples) {
    goodExamples = processGoodExamples(subtypeSettings.examples);
    badExamples = processBadExamples(subtypeSettings.examples);
  }
};

// Preliminary instructions
const additionalInstructionsSnippet = (subtypeSettings: SubtypeSettings, projectSettings: ProjectSettings): string => {
  const elements = [];
  if (projectSettings.ideas) elements.push('ideas: make sure to include and develop them');
  if (subtypeSettings.guidelines || projectSettings.guidelines) elements.push('guidelines: make sure to follow them');
  if (subtypeSettings.context || projectSettings.context) elements.push('context: make sure to take it into account');
  if (goodExamples) elements.push('good examples: make sure to be consistent with them');
  if (badExamples) elements.push('bad examples: identify what makes them bad and avoid this in your answer');

  if (elements.length === 0) return '';

  return `I have also included the following elements:
${elements.map(e => `- ${e}`).join('\n')}`;
};

const topicSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.topic ? `<topic>${projectSettings.topic}</topic>` : '';

const ideasSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.ideas ? `<ideas>${projectSettings.ideas}</ideas>\n` : '';

const repurpose_instructionsSnippet = (projectSettings: ProjectSettings): string =>
  (projectSettings.repurpose_instructions && projectSettings.action === "repurpose_content")  ? `<repurpose_instructions>${projectSettings.repurpose_instructions}</repurpose_instructions>` : '';

const contentSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.content ? `<content>${projectSettings.content}</content>` : '';

const productDescriptionSnippet = (projectSettings: ProjectSettings): string =>
  projectSettings.productDescription ? `<product_description>${projectSettings.productDescription}</product_description>` : '';

const targetAudienceSnippet = (subtypeSettings: SubtypeSettings, projectSettings: ProjectSettings): string => {
  // the project settings target audience overrides the subtype settings target audience
  if (projectSettings.target_audience) {
    return `<target_audience>${projectSettings.target_audience}</target_audience>`;
  } else if (subtypeSettings.target_audience) {
    return `<target_audience>${subtypeSettings.target_audience}</target_audience>`;
  } else {
    return '';
  }
}

const characterLimitSnippet = (projectSettings: ProjectSettings, contentType: ContentTypeName): string =>
  contentType === 'twitter_post' && typeof projectSettings.characterLimit === 'number'
    ? `<character_limit>${projectSettings.characterLimit}</character_limit>`
    : '';

const processedGuidelinesSnippet = (subtypeSettings: SubtypeSettings, projectSettings: ProjectSettings): string => {
  const guidelinesInstructions = (subtypeSettings.guidelines && projectSettings.guidelines) ? 'Here are generic guidelines and guidelines specific to this task. Follow both sets of guidelines, but in case of conflict, the task-specific guidelines take precedence. ' : '';
  const generalGuidelines = subtypeSettings.guidelines ? (projectSettings.guidelines? `<general_guidelines>${subtypeSettings.guidelines}</general_guidelines>`: `${subtypeSettings.guidelines}` ): "";
  const specificGuidelines = projectSettings.guidelines ? (subtypeSettings.guidelines? `<task_specific_guidelines>${projectSettings.guidelines}</task_specific_guidelines>`: `${projectSettings.guidelines}` ): "";

  if (generalGuidelines || specificGuidelines) {
    return `<guidelines>${guidelinesInstructions}${generalGuidelines}${specificGuidelines}</guidelines>`;
  } else {
    return '';
  }
};

const processedContextSnippet = (subtypeSettings: SubtypeSettings, projectSettings: ProjectSettings): string =>
  subtypeSettings.context || projectSettings.context ? `<context>
  ${subtypeSettings.context ? `${subtypeSettings.context}\n` : ""}
  ${projectSettings.context ? `${projectSettings.context}\n` : ""}
  </context>` : '';

const examplesSnippet = (): string => {
  if (!goodExamples && !badExamples) return '';
  const examples = `<examples>${goodExamples}\n${badExamples}</examples>`
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
  processExamples(subtypeSettings);
  const platform = platformSnippet(contentType);
  const snippets = [
    actionInstructionSnippet(projectSettings, platform),
    additionalInstructionsSnippet(subtypeSettings, projectSettings),
    topicSnippet(projectSettings),
    ideasSnippet(projectSettings),
    repurpose_instructionsSnippet(projectSettings),
    contentSnippet(projectSettings),
    productDescriptionSnippet(projectSettings),
    targetAudienceSnippet(subtypeSettings, projectSettings),
    characterLimitSnippet(projectSettings, contentType),
    processedGuidelinesSnippet(subtypeSettings, projectSettings),
    processedContextSnippet(subtypeSettings, projectSettings),
    examplesSnippet(),
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
