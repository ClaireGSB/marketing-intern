// src/recipes/linkedinPostRecipe.ts

// this is just a draft example, the actual implementation may vary

import type { Recipe, SubtypeSettings } from '../recipeTypes';
import { generateSystemPrompt, generateUserContentPrompt, generateRatingAndFeedbackPrompt } from '../promptGenerators/socialMediaPromptGenerator';
import type { UserInput } from '~/types/backendTypes';


// OutputTypes define the possible output types for each steps, this is where the output of each step is stored
const OutputTypes = [
  'temp_draftPost',
  'temp_postOptions',
  'temp_parsedPostOptions',
  'final_content'
] as const;

type OutputType = typeof OutputTypes[number];

const contentType = "linkedin_post";

const recipe: Recipe<UserInput, OutputType, SubtypeSettings> = {
  contentType: contentType,
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "Main Content Generation",
      model: "claude-3-haiku-20240307",
      // model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'temp_draftPost',
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_draftPost'),
      userContentTemplate: (_, config, subTypeSettings) => generateUserContentPrompt(config, subTypeSettings, contentType)
    },
    {
      stepName: "Rating and feeback",
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'temp_postOptions',
      outputJSON: true,
      systemPromptTemplate: (config) => generateSystemPrompt(config, contentType, 'temp_postOptions'),
      userContentTemplate: (content, config, subTypeSettings) => generateRatingAndFeedbackPrompt(
        config,
        subTypeSettings,
        contentType,
        content.temp_draftPost
      )
    },
    {
      stepName: "Parse JSON Output",
      stepType: 'jsonParse',
      inputKey: 'temp_postOptions',
      outputType: 'temp_parsedPostOptions',
    },
    {
      stepName: "User Approval",
      stepType: 'userValidation',
      outputType: 'final_content',
      options: (content) => content.temp_parsedPostOptions?.options || {},
    }
  ]
};

export default recipe;
