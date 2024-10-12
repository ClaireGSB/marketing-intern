// src/recipes/twitterIdeasRecipe.ts

// this is just a draft example, the actual implementation may vary

import { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';

// Config defines the inputs to the recipe
type Config = ProjectSettings & {
  productContext: string;
  twitterStrategy: string;
  twitterExamples: string;
  additionalInstructions?: string;
  expertise?: string;
};

// OutputTypes define the possible output types for each steps, this is where the output of each step is stored
const OutputTypes = [
  'ideaList',
] as const;

type OutputType = typeof OutputTypes[number];

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: "twitter_post_ideas",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "Idea Generation",
      model: "claude-3-haiku-20240307",
      // model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'ideaList',
      systemPromptTemplate: (config) =>
        `You are a social media expert${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}.`,
      userContentTemplate: (_, config, data) =>
        `Here is some context about our product <product>${config.productContext}</product>. Based on our Twitter strategy <strategy>${config.twitterStrategy}</strategy>, and examples of some of our past tweets <examples>${config.twitterExamples}</examples>, generate 3-5 ideas for new Twitter posts.
        Each idea should be for a specific post, not a category of posts, but do not write the post, just list the ideas in a bullet point list, 5-10 words per idea. ${config.additionalInstructions ? `<additionalInstructions> ${config.additionalInstructions}</additionalInstructions>` : ''}`,
    },
  ]
};

export default recipe;
