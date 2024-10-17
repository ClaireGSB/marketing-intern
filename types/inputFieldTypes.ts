// shared/inputFieldTypes.ts

export type FieldType = 'text' | 'textarea';
export type FieldUse = 'action_specific' | 'general' | 'content_type_specific';
export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  use: FieldUse;
  allowSelection?: boolean;
  selectionFilters?: Record<string, any>;
  validation?: {
    minChar?: number;
    maxChar?: number;
  };
}

export const inputFields: Record<string, FieldConfig> = {
  topic: {
    key: 'topic',
    label: 'Topic',
    type: 'text',
    use: 'action_specific',
    validation: { maxChar: 100 }
  },
  ideas: {
    key: 'ideas',
    label: 'Ideas',
    type: 'textarea',
    use: 'action_specific',
    validation: { maxChar: 500 }
  },
  content: {
    key: 'content',
    label: 'Content',
    type: 'textarea',
    use: 'action_specific',
    allowSelection: true,
    selectionFilters: { status: 'completed' },
    validation: { maxChar: 1000 }
  },
  repurpose_instructions: {
    key: 'repurpose_instructions',
    label: 'Repurpose Instructions',
    type: 'textarea',
    use: 'action_specific',
    validation: { maxChar: 500 }
  },
  productDescription: {
    key: 'product_description',
    label: 'Product Description',
    type: 'textarea',
    use: 'action_specific',
    validation: { maxChar: 500 }
  },
  outline: {
    key: 'outline',
    label: 'Outline',
    type: 'textarea',
    use: 'content_type_specific',
    allowSelection: true,
    selectionFilters: { status: 'completed', content_type_id: 8 },
    validation: { minChar: 20, maxChar: 1000 }
  },
  seoPhrase: {
    key: 'seo_phrase',
    label: 'Primary SEO Phrase',
    type: 'text',
    use: 'content_type_specific',
    validation: { maxChar: 100 }
  },
  target_audience: {
    key: 'target_audience',
    label: 'Target audience. This will override the target audience defined in your settings.',
    type: 'text',
    use: 'general',
    validation: { minChar: 5, maxChar: 50 }
  },
  guidelines: {
    key: 'guidelines',
    label: 'Guidelines specific to this project. They will be added to the guidelines defined in your settings for this project.',
    type: 'textarea',
    use: 'general',
    validation: { minChar: 10, maxChar: 200 }
  },
  context: {
    key: 'context',
    label: 'Context specific to this project. It will be added to the context defined in your settings for this project.',
    type: 'textarea',
    use: 'general',
    validation: { minChar: 10, maxChar: 200 }
  },
};

export const generalOptionalFields: string[] = ['target_audience', 'guidelines', 'context'];
