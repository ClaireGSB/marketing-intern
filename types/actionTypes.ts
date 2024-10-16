// types/actionTypes.ts

import { inputFields } from './inputFieldTypes';

export interface ActionConfig {
  display_name: string;
  allowContentSelection?: boolean; // Allows user to select content from a list
  requiredFields: string[]; // Array of keys referencing required inputFields
  optionalFields: string[]; // Array of keys referencing optional inputFields
}

export const actions: Record<string, ActionConfig> = {
  write_topic: {
    display_name: "Write Topic",
    requiredFields: ['topic'],
    optionalFields: ['ideas'],
  },
  promote_content: {
    display_name: "Promote Content",
    allowContentSelection: true,
    requiredFields: ['content'],
    optionalFields: [],
  },
  repurpose_content: {
    display_name: "Repurpose Content",
    allowContentSelection: true,
    requiredFields: ['content', 'repurpose_instructions'],
    optionalFields: [],
  },
  promote_product: {
    display_name: "Promote Product",
    requiredFields: ['productDescription'],
    optionalFields: [],
  }
};
