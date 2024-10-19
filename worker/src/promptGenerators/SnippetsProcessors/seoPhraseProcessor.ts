// src/promptGenerators/snippetsProcessors/targetAudienceProcessor.ts

import type { SubtypeSettings } from '../../recipeTypes';
import type { UserInput } from '~/types/backendTypes';

export const seoPhraseSnippet = (projectSettings: UserInput): string => {
  if (projectSettings.seo_phrase) {
    return `<seo_phrase>${projectSettings.seo_phrase}</seo_phrase>`;
  } else {
    return '';
  }
}
