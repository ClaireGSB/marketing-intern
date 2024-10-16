import type { UserInput } from '~/types/backendTypes';
import { processContent } from './contentProcessor';
import type { ContentTypeName } from '~/types/contentTypes';


////////// ACTION PROMPT SNIPPET COMPILATION //////////

export const actionFieldsSnippet = (projectSettings: UserInput): string => {
  const actionFields = {
    write_topic: () => topicSnippet(projectSettings) + ideasSnippet(projectSettings),
    promote_content: () => contentSnippet(projectSettings),
    repurpose_content: () => contentSnippet(projectSettings) + repurposeInstructionsSnippet(projectSettings),
    promote_product: () => ''
  };

  const action = projectSettings.action as keyof typeof actionFields;
  return actionFields[action] ? actionFields[action]() : '';
}

///////// INITIAL INSTRUCTIONS SNIPPET //////////

export const actionInstructionGenericSnippet = (projectSettings: UserInput, contentType: ContentTypeName): string => {
  const content = contentTypeSnippet(contentType);
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
  console.log('contentType:', contentType);
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

// specific action instructions for blog outline
export const actionInstructionBlogOutlineSnippet = (projectSettings: UserInput, contentType: ContentTypeName): string => {
  const actions = {
    write_topic: `Below is a proposed topic for a blog post. Based on it, please create a detailed outline for the post with main sections and subsections. Only answer with the outline, no explanation, comment or question.`,
    promote_content: `Below is a piece of content that we want to promote in an upcoming blog post. Please create a detailed outline for the blog post with main sections and subsections. Only answer with the outline, no explanation, comment or question.`,
    repurpose_content: `Below is a piece of content that we want to repurpose in an upcoming blog post. We'll repurpose it in the way detailed in the repurposing instructions provided below. Please create a detailed outline for the blog post with main sections and subsections. If the repurposing instructions are unclear or not provided, provide your best guess. Only answer with the outline, no explanation, comment or question.`,
    promote_product: `Below is a product that we want to promote in an upcoming blog post. Please create a detailed outline for the blog post with main sections and subsections. Only answer with the outline, no explanation, comment or question.`,
  };

  let instruction = actions[projectSettings.action as keyof typeof actions];

  return instruction;
};



///////// ACTION FIELDS SNIPPETS //////////

/// 1. Content & instructions (for promote_content and repurpose_content actions)

function contentSnippet(projectSettings: UserInput): string {
  return processContent(projectSettings);
}

function repurposeInstructionsSnippet(projectSettings: UserInput): string {
  return (projectSettings.repurpose_instructions && projectSettings.action === "repurpose_content") ? `<repurpose_instructions>${projectSettings.repurpose_instructions}</repurpose_instructions>` : '';
}

// TO DO: add promotion instructions

/// 2. Topic (for write_topic action)

function topicSnippet(projectSettings: UserInput): string {
  return projectSettings.topic ? `<topic>${projectSettings.topic}</topic>\n` : '';
}

function ideasSnippet(projectSettings: UserInput): string {
  return projectSettings.ideas ? `<ideas>${projectSettings.ideas}</ideas>\n` : '';
}

/// 3. TO DO: Product fields 
