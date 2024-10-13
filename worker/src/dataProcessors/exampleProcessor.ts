// src/dataProcessors/exampleProcessor.ts

import type { Example } from '../../../types/backendTypes';

export function processExamples(examples: Example[]): string {
  return examples.map(example => {
    const tag = example.example_type === 'good' ? 'Example of good content' : 'Example of bad content';
    return `<${tag}>${example.content}</${tag}>`;
  }).join('\n');
}

export function processGoodExamples(examples: Example[]): string {
  return examples.filter(example => example.example_type === 'good').map(example => {
    return `<example_of_good_content>${example.content}${example.explanation ? `<Explanation>${example.explanation}</Explanation>` : ''}</example_of_good_content>`;
  }).join('\n');
}

export function processBadExamples(examples: Example[]): string {
  return examples.filter(example => example.example_type === 'bad').map(example => {
    return `<example_of_bad_content>${example.content}${example.explanation ? `<Explanation>${example.explanation}</Explanation>` : ''}</example_of_bad_content>`;
  }).join('\n');
}
