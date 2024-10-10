// shared/actionTypes.ts

import { inputFields } from './inputFieldTypes';

export interface ActionConfig {
  display_name: string;
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
    requiredFields: ['content'],
    optionalFields: [],
  },
  repurpose_content: {
    display_name: "Repurpose Content",
    requiredFields: ['content'],
    optionalFields: [],
  },
  promote_product: {
    display_name: "Promote Product",
    requiredFields: ['productDescription'],
    optionalFields: [],
  },
  write_outline: {
    display_name: "Write Outline",
    requiredFields: ['outline'],
    optionalFields: [],
  }
};
