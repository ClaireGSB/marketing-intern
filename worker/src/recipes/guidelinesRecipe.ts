// src/recipes/guidelinesRecipe.ts

import { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';

// Config defines the inputs to the recipe
type Config = ProjectSettings & {
  contentType: string;
  contentExamplesFiles: string[];
  // contentExamples is a string like this: Example 1: ..., Example 2: ..., Example 3: ...
  contentExamples: string;
  expertise?: string;
};

// OutputTypes define the possible output types for each steps, this is where the output of each step is stored
const OutputTypes = [
  'copyGuidelines',
  'outlineGuidelines',
] as const;

type OutputType = typeof OutputTypes[number];

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: "guidelines",
  outputTypes: OutputTypes,
  steps: [
    {
      stepName: "Outline Guidelines",
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'outlineGuidelines',
      systemPromptTemplate: (config) =>
        `You are an expert content strategist${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. The user will share a few different ${config.contentType} as example of what good looks like. Based on these examples, suggest guidelines for how to create outlines of blog posts that are similar. Do not focus on they subject matter or the copywriting but rather on the outline structure. Answer with just the guidelines in bullet points of no more than 10 words each.`,
      userContentTemplate: (_, config) =>
        `${config.contentExamples}`
    },
    {
      stepName: "Copy Guidelines",
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      outputType: 'copyGuidelines',
      systemPromptTemplate: (config) =>
        `You are an expert content writer${config.expertise ? ` with deep knowledge in ${config.expertise}` : ''}. The user will share a few different ${config.contentType} as example of what good looks like. Based on these examples, suggest stylistic guidelines for future blog post with similar style. Do not focus on the subject matter or the outline, but on the style, tone, sentence complexity and length, etc. Answer with the guidelines in bullet points of no more than 10 words each, without introduction. Include specific recommendations for:

  • Flesh-Kincaid reading level (specify exact level)
  • Overall tone (e.g., formal, conversational, authoritative, humorous)
  • Sentence complexity (e.g., simple, compound, complex; variety)
  • Average sentence length (provide a range in words)
  • Paragraph structure (e.g., length, topic sentences, transitions)
  • Vocabulary level and type of lexicon used
  • Use of jargon or technical terms (frequency and explanation)
  • Information density (e.g., high, moderate, low; facts per paragraph)
  • Use of rhetorical devices (e.g., metaphors, analogies, rhetorical questions)
  • Active vs. passive voice preference
  • Person and point of view (e.g., first person, second person, third person)
  • Use of examples, anecdotes, or case studies
  • Formatting elements (e.g., subheadings, bullet points, block quotes)
  • Incorporation of data or statistics (frequency and presentation)
  • Calls to action (presence, style, and placement)
  • Linkage to external sources or references (frequency and style)
  • Use of humor or wit (if applicable)
  • Emotional appeal or pathos (level and techniques used)
  • Conclusion style (e.g., summary, thought-provoking question, call to action)
  • Information repetition strategy (e.g., avoid repetition, use strategic repetition, reinforce key points)`,
      userContentTemplate: (content, config) =>
        `${config.contentExamples}`
    },
  ]
};

export default recipe;
