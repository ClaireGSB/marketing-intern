import type { UserInput } from '~/types/backendTypes';
import type { SubtypeSettings } from '../../recipeTypes';
import { goodExamplesPresent, badExamplesPresent } from './exampleProcessor';
import { contentTypes } from '~/types/contentTypes';
import type {ContentTypeName} from '~/types/contentTypes';


export const additionalInstructionsSnippet = (subtypeSettings: SubtypeSettings, projectSettings: UserInput, contentType: ContentTypeName): string => {
  const elements = [];
  if (projectSettings.ideas) elements.push('ideas: make sure to include and develop them');
  if (projectSettings.seo_phrase) elements.push(seo_phrase_instruction(contentType));
  if (subtypeSettings.guidelines || projectSettings.guidelines) elements.push('guidelines: make sure to follow them');
  if (subtypeSettings.context || projectSettings.context) elements.push('context: make sure to take it into account');
  if (goodExamplesPresent(subtypeSettings)) elements.push('good examples: make sure to be consistent with them');
  if (badExamplesPresent(subtypeSettings)) elements.push('bad examples: identify what makes them bad and avoid this in your answer');

  if (elements.length === 0) return '';

  return `I have also included the following elements:
${elements.map(e => `- ${e}`).join('\n')}`;
};

const seo_phrase_instruction = (contentType: ContentTypeName): string => {
  if (contentType === 'blog_post') return 'SEO phrase: make sure to SEO optimize for it. Do not change the structure of the outline in order to SEO optimize, but you can change the wording of titles or subtitles.';
  if (contentType === 'blog_outline') return `SEO phrase: it'll be used more at the copy stage, but you should have it in mind while building the outline`; 
  else return '';
}