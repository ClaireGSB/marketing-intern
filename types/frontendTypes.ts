// shared/frontendTypes.ts

import * as BackendTypes from './backendTypes';

// type OmitHousekeeping<T> = Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by' | 'updated_by'>;

// export type Users = OmitHousekeeping<BackendTypes.Users>;
// export type Organizations = OmitHousekeeping<BackendTypes.Organizations>;
// export type ContentType = OmitHousekeeping<BackendTypes.ContentType>;
// export type ContentSubType = OmitHousekeeping<BackendTypes.ContentSubType>;
// export type Example = OmitHousekeeping<BackendTypes.Example>;
// export type ContentOutput = OmitHousekeeping<BackendTypes.ContentOutput>;
// export type BlogMetadata = OmitHousekeeping<BackendTypes.BlogMetadata>;
// export type ContentGenerationUserInput = OmitHousekeeping<BackendTypes.ContentGenerationUserInput>;
// export type TokenUsage = OmitHousekeeping<BackendTypes.TokenUsage>;
// export type StepOutput = OmitHousekeeping<BackendTypes.StepOutput>;
// export type UserInput = OmitHousekeeping<BackendTypes.UserInput>;
// export type SettingsInput = OmitHousekeeping<BackendTypes.SettingsInput>;

// export interface AppData {
//   content_types: ContentType[];
//   content_sub_types: ContentSubType[];
//   examples: Example[];
//   content_outputs: ContentOutput[];
//   blog_metadata: BlogMetadata[];
//   content_generation_user_input: ContentGenerationUserInput[];
//   token_usage: TokenUsage[];
//   step_outputs: StepOutput[];
// }

export interface Users {
  id: number;
  org_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
}

export interface ContentSubType {
  id: string;
  org_id: string;
  content_type_id: number;
  name: string;
  context: string | null;
  guidelines: string | null;
  target_audience: string | null;
}

export interface Example {
  id: number;
  content_subtype_id: number | null;
  example_type: string;
  name: string;
  content: string | null;
  explanation: string | null;
}

export interface ContentOutput {
  id: number;
  created_by: number;
  content_type_id: number;
  content_subtype_id: string | null;
  content: string;
  created_at: string;
  status: 'generating' | 'pending validation' | 'completed' | 'scheduled' | 'published' | 'failed';
}

export interface BlogMetadata {
  id: number;
  content_output_id: number;
  title_options: string[];
  title?: string;
  meta_description: string;
  formatted_post?: string;
}

export interface ContentGenerationUserInput {
  id: number;
  content_output_id: number;
  user_id: number;
  parameter_name: string;
  parameter_value: string;
}

export interface UserInput {
  subTypeID: number;
  action: string;
  topic?: string;
  target_audience?: string;
  guidelines?: string;
  context?: string;
}

export interface SettingsInput {
  target_audience?: string;
  guidelines?: string;
  context?: string;
  examples: Example[];
}


///// TO DO: Refactor this data structure to match the final data shape
export interface GeneratedContentResponse {
  requiresValidation: boolean;
  contentOutput: ContentOutput;
  validationData?: Validations[];
}

export interface Validations {
  id: number;
  content_output_id: number;
  step_output_type: string;
  validation_status: "pending" | "completed";
  options: Record<string, string>;
  feedback: Record<string, string>;
  selected_option: string;
}

// options will look like this:
// {
//   1: "10 Ways to Boost Your Productivity",
//   2: "Unleash Your Productivity: 10 Game-Changing Strategies",
//   3: "Mastering Productivity: 10 Expert Tips for Success"
// }

// feedback will look like this:
// {
//   1: "This is a good title",
//   2: "This is a great title",
//   3: "This is a fantastic title"
// }

// 3. Data shape for final content display
export interface FinalContentItem {
  id: string;
  title: string;
  content: string;
}
