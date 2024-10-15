// src/promptGenerators/snippetsProcessors/guidelineProcessor.ts

import type { SubtypeSettings } from '../../recipeTypes';
import type { UserInput } from '~/types/backendTypes';

export const guidelinesSnippet = (subtypeSettings: SubtypeSettings, projectSettings: UserInput): string => {
  const guidelinesInstructions = (subtypeSettings.guidelines && projectSettings.guidelines) ? 'Here are generic guidelines and guidelines specific to this task. Follow both sets of guidelines, but in case of conflict, the task-specific guidelines take precedence. ' : '';
  const generalGuidelines = subtypeSettings.guidelines ? (projectSettings.guidelines? `<general_guidelines>${subtypeSettings.guidelines}</general_guidelines>`: `${subtypeSettings.guidelines}` ): "";
  const specificGuidelines = projectSettings.guidelines ? (subtypeSettings.guidelines? `<task_specific_guidelines>${projectSettings.guidelines}</task_specific_guidelines>`: `${projectSettings.guidelines}` ): "";

  if (generalGuidelines || specificGuidelines) {
    return `<guidelines>${guidelinesInstructions}${generalGuidelines}${specificGuidelines}</guidelines>`;
  } else {
    return '';
  }
};
