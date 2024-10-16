// src/promptGenerators/snippetsProcessors/targetAudienceProcessor.ts

import type { SubtypeSettings } from '../../recipeTypes';
import type { UserInput } from '~/types/backendTypes';

export const outlineSnippet = (projectSettings: UserInput): string => {
  // the project settings target audience overrides the subtype settings target audience
  if (projectSettings.outline) {
    return `<outline>${projectSettings.outline}</outline>`;
  } else {
    return '';
  }
}
