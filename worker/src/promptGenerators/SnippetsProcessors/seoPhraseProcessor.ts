// src/promptGenerators/snippetsProcessors/targetAudienceProcessor.ts

import type { SubtypeSettings } from '../../recipeTypes';
import type { UserInput } from '~/types/backendTypes';

export const seoPhraseSnippet = (projectSettings: UserInput): string => {
  // the project settings target audience overrides the subtype settings target audience
  if (projectSettings.seo_phrase) {
    return `<seo_phrase>${projectSettings.seo_phrase}</seo_phrase>`;
  } else {
    return '';
  }
}
