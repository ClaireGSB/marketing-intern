// types/actionTypes.ts

import { inputFields } from './inputFieldTypes';

export interface ActionConfig {
  display_name: string;
  requiredFields: string[]; // Array of keys referencing required inputFields
  optionalFields: string[]; // Array of keys referencing optional inputFields
  availableForCampaigns?: boolean;
  requiredFieldsForCampaigns?: string[]; // Array of keys referencing required inputFields for campaigns
}

export const actions: Record<string, ActionConfig> = {
  write_topic: {
    display_name: "Write Topic",
    requiredFields: ['topic'],
    optionalFields: ['ideas'],
    availableForCampaigns: true,
    requiredFieldsForCampaigns: ['topic'],
  },
  promote_content: {
    display_name: "Promote Content",
    requiredFields: ['content'],
    optionalFields: [],
    availableForCampaigns: true,
    requiredFieldsForCampaigns: ['content'],

  },
  repurpose_content: {
    display_name: "Repurpose Content",
    requiredFields: ['content', 'repurpose_instructions'],
    optionalFields: [],
    availableForCampaigns: true,
    requiredFieldsForCampaigns: ['content'],
  },
  promote_product: {
    display_name: "Promote Product",
    requiredFields: ['product_description'],
    optionalFields: [],
    availableForCampaigns: true,
    requiredFieldsForCampaigns: ['product_description'],
  }
};
