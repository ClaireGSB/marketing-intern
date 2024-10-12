// src/recipes/nativishScreenshotRecipe.ts

// ------------------------------------------------------------
// This recipe generates a screenshot of a Nativish example, taking as input a user input (incorrect sentence);
// Step 1: run the input text through the Nativish API to get a suggestion and explanation
// Step 2: render the input text, suggestion, and explanation as nativish HTML
// Step 3: generate a screenshot of the rendered HTML
// ------------------------------------------------------------

import { config } from 'dotenv';
import { Recipe, ProjectSettings, SubtypeSettings } from '../recipeTypes';
import path from 'path';

// Config defines the inputs to the recipe
type Config = ProjectSettings & {
  topic: string;
  language: string;
  inputText: string;
  examples: string;
};

// OutputTypes define the possible output types for each steps, this is where the output of each step is stored
const OutputTypes = [
  'apiOutput',
  'renderData',
  'screenshotPath'
] as const;

type OutputType = typeof OutputTypes[number];

const recipe: Recipe<Config, OutputType, SubtypeSettings> = {
  contentType: "nativish_screenshot",
  outputTypes: OutputTypes,
  steps: [
    {
      stepType: 'nativishAPI',
      stepName: 'Generate Nativish API Output',
      outputType: 'apiOutput',
      inputText: (config) => config.inputText,
    },
    {
      stepName: "HTML Rendering",
      stepType: 'nativishHtmlRender',
      outputType: 'renderData',
      inputJsonKey: 'apiOutput'
    },
    {
      stepType: 'screenshot',
      stepName: 'Generate Screenshot',
      outputType: 'screenshotPath',
      htmlFilePath: path.join(__dirname, '..', '..', '..', 'public', 'screenshotHTML', 'nativish.html'),
      dataKey: 'renderData'
    },
    {
      stepName: "Tweet Generation",
      model: "claude-3-5-sonnet-20240620",
      stepType: 'llm',
      temperature: 0.8,
      outputType: 'tweetIdeas',
      systemPromptTemplate: (config) =>
        `You are a expert linguist and language teacher${config.language ? `in ${config.language}.` : '. You have a deep understanding of all languages in the world.'}`,
      userContentTemplate: (content, config) =>
        `Nativish is a LLM-powered application that generates a more fluent version of any written text, in any language. When we tweet, we post a screenshot that contains an incorrect sentence, a suggestion of corrected sentence, and an explanation of the correction. Here are examples of the type of tweet we post, that are illustrated by a screenshot: <examples>${config.examples}</examples>.
        Today's screenshot is about ${config.topic} in ${config.language}.
        The example on the screenshot is: 
        - Incorrect sentence: ${config.inputText}
        - Corrected suggestion: ${content.suggestion}
        - Explanation: ${content.explanation}
        Your task is to create a Twitter post that introduces the screenshot and encourages engagement. Follow these guidelines:
        - The post should be engaging, informative, and tailored to the target audience.
        - No fluff, straight to the point, and either witty or informative, but not overly enthusiatic. See examples for reference.
        - The post should be mainly in English, but you can include a few words in ${config.language} if you think it will make the post more engaging.
        - Do not reference the screenshot (eg do not say "Check out this screenshot" or "check out this example"), as the screenshot will be attached to the post and people will naturally see it.
        
        In order to create the best possible post, please output 5 different versions.`
    }
  ]
};

export default recipe;
