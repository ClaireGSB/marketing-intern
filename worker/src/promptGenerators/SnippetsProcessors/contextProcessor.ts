// src/promptGenerators/snippetsProcessors//contextProcessor.ts

import type { SubtypeSettings } from '../../recipeTypes';
import type { UserInput } from '~/types/backendTypes';

  export const contextSnippet = (subtypeSettings: SubtypeSettings, projectSettings: UserInput): string => {
    const contextInstructions = (subtypeSettings.context && projectSettings.context) ? 'Here are some generic context, and context specific to this task. Take both into account, but in case of conflict, the task-specific context takes precedence. ' : '';
    const generalContext = subtypeSettings.context ? (projectSettings.context? `<general_context>${subtypeSettings.context}</general_context>`: `${subtypeSettings.context}` ): "";
    const specificContext = projectSettings.context ? (subtypeSettings.context? `<task_specific_context>${projectSettings.context}</task_specific_context>`: `${projectSettings.context}` ): "";
  
    if (generalContext || specificContext) {
      return `<context>${contextInstructions}${generalContext}${specificContext}</context>`;
    } else {
      return '';
    }
  };
