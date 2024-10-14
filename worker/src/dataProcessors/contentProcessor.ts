// src/dataProcessors/contentProcessor.ts

import type { UserInput } from '../../../types/backendTypes';

export function processContent(projectSettings: UserInput): string {
  console.log('Processing content');
  if (!projectSettings.content) {
    console.log('No content provided');
    throw new Error('No content provided');
  }
  if (projectSettings.selected_content_output_id) {
    // the user selected an existing content output so we have several fields
    console.log('Processing content for existing content output');
    const contentType = projectSettings.selected_content_type ? `<content_type>${projectSettings.selected_content_type}</content_type>\n` : '';
    const title = projectSettings.selected_content_blog_metadata?.title ? `<title>${projectSettings.selected_content_blog_metadata.title}</title>\n` : '';
    const content = projectSettings.content? `<text>${projectSettings.content}</text>` : '';
    return `<content>${contentType}${title}${content}<content>`;
  } else {
    console.log('Processing content for new content output');
    // the user manually entered a text content
    return `<content>${projectSettings.content}</content>`
  }
}
