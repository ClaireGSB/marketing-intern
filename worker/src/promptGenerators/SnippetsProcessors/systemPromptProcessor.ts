// src/promptGenerators/snippetsProcessors/systemPromptProcessor.ts

import type { UserInput } from '~/types/backendTypes';
import type { ContentTypeName } from '~/types/contentTypes';

export function systemPromptSnippet(projectSettings: UserInput, contentType: ContentTypeName, outputType: string): string {
  const role = roleSnippet(outputType, contentType);
  const expertise = expertiseSnippet(projectSettings);
  const prompt = `You are an expert ${role}${expertise}.`;
  console.log('---------------------\nSystem prompt:');
  console.log(prompt);
  return prompt
}

const expertiseSnippet = (projectSettings: UserInput): string =>
  projectSettings.expertise ? ` with deep knowledge in ${projectSettings.expertise}` : '';

// const platformSnippet = (contentType: ContentTypeName): string =>
//   contentType === 'linkedin_post' ? 'LinkedIn' : 'Twitter';

// const contentTypeSnippet = (contentType: ContentTypeName): string =>
//   contentType === 'linkedin_post' ? 'Linkedin Post' : 'Twitter Post';


const roleSnippet = (outputType: string, contentType: ContentTypeName): string => {
  if (outputType === "temp_draftPost") {
    switch (contentType) {
      case "linkedin_post":
        return "Linkedin post writer";
      case "twitter_post":
        return "Twitter post writer";
      case "blog_post":
        return "Blog post writer";
      default:
        // It's a good practice to handle unexpected cases.
        throw new Error("Unsupported content type");
    }
  } else if (outputType === "temp_postOptions") {
    switch (contentType) {
      case "linkedin_post":
        return "Linkedin post editor";
      case "twitter_post":
        return "Twitter post editor";
      case "blog_post":
        return "Blog post editor";
      case "blog_outline":
        return "Blog post editor";
      default:
        throw new Error("Unsupported content type");
    }
  } else if (outputType === "temp_outline") {
    switch (contentType) {
      case "blog_outline":
        return "content outliner";
      default:
        throw new Error("Unsupported content type");
    }
  } else {
    throw new Error("Unsupported output type");
  }
}
