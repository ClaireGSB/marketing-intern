import type { UserInput } from '~/types/backendTypes';
import { processContent } from './contentProcessor';
import type { ContentTypeName } from '~/types/contentTypes';


////////// ACTION PROMPT SNIPPET COMPILATION //////////

export const actionFieldsSnippet = (projectSettings: UserInput): string => {
  const actionFields = {
    write_topic: topicSnippet(projectSettings) + ideasSnippet(projectSettings),
    promote_content: contentSnippet(projectSettings),
    repurpose_content: contentSnippet(projectSettings) + repurpose_instructionsSnippet(projectSettings),
    promote_product: ''
  };

  return actionFields[projectSettings.action as keyof typeof actionFields] || '';
}


///////// INITIAL INSTRUCTIONS SNIPPET //////////

export const actionInstructionSnippet = (projectSettings: UserInput, contentType: ContentTypeName): string => {
  const content = contentTypeSnippet(projectSettings.content_subtype_id);
  const actions = {
    write_topic: `Write a ${content} on the topic provided below`,
    promote_content: `Write a ${content} that promotes the content provided below`,
    repurpose_content: `Repurpose the content provided below, based on the repurposing instructions, into a ${content}`,
    promote_product: `Write a ${content} that subtly promotes the product described below`,
    default: `Write a ${content}`
  };

  let instruction = actions[projectSettings.action as keyof typeof actions] || actions.default;

  if (projectSettings.target_audience) {
    instruction += `, optimized for the target audience`;
  }

  return instruction + '.';
};

export const contentTypeSnippet = (contentType: string): string => {
  switch (contentType) {
    case 'twitter_post':
      return 'tweet';
    case 'linkedin_post':
      return 'LinkedIn post';
    case 'blog_post':
      return 'Blog post';
    default:
      throw new Error("Unsupported content type");
  }
}


///////// ACTION FIELDS SNIPPETS //////////

/// 1. Content & instructions (for promote_content and repurpose_content actions)

const contentSnippet = (projectSettings: UserInput): string =>
  processContent(projectSettings);

const repurpose_instructionsSnippet = (projectSettings: UserInput): string =>
  (projectSettings.repurpose_instructions && projectSettings.action === "repurpose_content")  ? `<repurpose_instructions>${projectSettings.repurpose_instructions}</repurpose_instructions>` : '';

// TO DO: add promotion instructions

/// 2. Topic (for write_topic action)

const topicSnippet = (projectSettings: UserInput): string =>
  projectSettings.topic ? `<topic>${projectSettings.topic}</topic>\n` : '';

const ideasSnippet = (projectSettings: UserInput): string =>
  projectSettings.ideas ? `<ideas>${projectSettings.ideas}</ideas>\n` : '';

/// 3. TO DO: Product fields 
