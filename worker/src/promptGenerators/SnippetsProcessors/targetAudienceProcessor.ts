// src/promptGenerators/snippetsProcessors/targetAudienceProcessor.ts

import type { SubtypeSettings } from '../../recipeTypes';
import type { UserInput } from '~/types/backendTypes';

export const targetAudienceSnippet = (subtypeSettings: SubtypeSettings, projectSettings: UserInput): string => {
  // the project settings target audience overrides the subtype settings target audience
  if (projectSettings.target_audience) {
    return `<target_audience>${projectSettings.target_audience}</target_audience>`;
  } else if (subtypeSettings.target_audience) {
    return `<target_audience>${subtypeSettings.target_audience}</target_audience>`;
  } else {
    return '';
  }
}
