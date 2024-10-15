// src/dataProcessors/exampleProcessor.ts

import type { Example } from '../../../../types/backendTypes';
import type { SubtypeSettings } from '../../recipeTypes';


export function examplesSnippet(subtypeSettings: SubtypeSettings) {
  const goodExamples = goodExampleSnippets(subtypeSettings.examples);
  const badExamples = badExampleSnippet(subtypeSettings.examples);
  if (!goodExamples && !badExamples) return '';
  const examples = `<examples>${goodExamples}${badExamples}</examples>\n`;
  return examples;
};

function goodExampleSnippets(examples: Example[]): string {
  return examples.filter(example => example.example_type === 'good').map(example => {
    return `<example_of_good_content>${example.content}${example.explanation ? `<Explanation>${example.explanation}</Explanation>` : ''}</example_of_good_content>`;
  }).join('\n');
}

function badExampleSnippet(examples: Example[]): string {
  return examples.filter(example => example.example_type === 'bad').map(example => {
    return `<example_of_bad_content>${example.content}${example.explanation ? `<Explanation>${example.explanation}</Explanation>` : ''}</example_of_bad_content>`;
  }).join('\n');
}

export function goodExamplesPresent(subtypeSettings: SubtypeSettings): boolean {
  return subtypeSettings.examples.some(example => example.example_type === 'good');
}

export function badExamplesPresent(subtypeSettings: SubtypeSettings): boolean {
  return subtypeSettings.examples.some(example => example.example_type === 'bad');
}
