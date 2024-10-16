import type { UserInput } from '~/types/backendTypes';
import type { SubtypeSettings } from '../../recipeTypes';
import { goodExamplesPresent, badExamplesPresent } from './exampleProcessor';


export const additionalInstructionsSnippet = (subtypeSettings: SubtypeSettings, projectSettings: UserInput): string => {
  const elements = [];
  if (projectSettings.ideas) elements.push('ideas: make sure to include and develop them');
  if (projectSettings.seo_phrase) elements.push('seo phrase: make sure to SEO optimize for it');
  if (subtypeSettings.guidelines || projectSettings.guidelines) elements.push('guidelines: make sure to follow them');
  if (subtypeSettings.context || projectSettings.context) elements.push('context: make sure to take it into account');
  if (goodExamplesPresent(subtypeSettings)) elements.push('good examples: make sure to be consistent with them');
  if (badExamplesPresent(subtypeSettings)) elements.push('bad examples: identify what makes them bad and avoid this in your answer');

  if (elements.length === 0) return '';

  return `I have also included the following elements:
${elements.map(e => `- ${e}`).join('\n')}`;
};
