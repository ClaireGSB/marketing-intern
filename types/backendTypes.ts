// shared/backendTypes.ts

export interface Users {
  id: number;
  org_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_admin: boolean;
}

export interface Organizations {
  id: number;
  name: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ContentSubType {
  id: number;
  user_id: number;
  content_type_id: number;
  name: string;
  context: string | null;
  guidelines: string | null;
  target_audience: string | null;
  created_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_at: string;
}

export interface Example {
  id: number;
  created_by: number;
  updated_by: number;
  content_subtype_id: number | null;
  content_output_id?: number;
  example_type: string;
  name: string;
  content: string | null;
  created_at: string;
  deleted_at: string | null;
  explanation: string | null;
}

export interface ContentOutput {
  id: number;
  created_by: number;
  content_type_id: number;
  content_subtype_id: number | null;
  original_content_id: number | null;
  version_number: number;
  content: string;
  created_at: string;
  status: 'generating' | 'pending validation' | 'completed' | 'scheduled' | 'published' | 'failed';
  is_current_version: boolean;
}

export interface BlogMetadata {
  id: number;
  content_output_id: number;
  title_options: string[];
  title?: string;
  meta_description: string;
  formatted_post?: string;
}

export interface Validations {
  id: number;
  content_output_id: number;
  step_output_type: string;
  validation_status: "pending" | "completed";
  options: Record<string, string>;
  feedback: Record<string, string>;
  selected_option: string;
  created_at: string;
  updated_at: string;
  updated_by: number;
}

// options will look like this:
// {
//   "1": "10 Ways to Boost Your Productivity",
//   "2": "Unleash Your Productivit"y": 10 Game-Changing Strategies",
//   "3": "Mastering Productivit"y": 10 Expert Tips for Success"
// }

// feedback will look like thi"s":
// {
//   "1": "This is a good title",
//   "2": "This is a great title",
//   "3": "This is a fantastic title"
// }

// selected_option is the key of the selected option in the options object



export interface ContentGenerationUserInput {
  id: number;
  content_output_id: number;
  user_id: number;
  parameter_name: string;
  parameter_value: string;
}

export interface TokenUsage {
  id: number;
  user_id: number;
  content_output_id: number;
  step_output_id: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
}

export interface StepOutput {
  id: number;
  content_output_id: number;
  step_name: string;
  step_output_type: string;
  step_status: "completed" | "failed" | "skipped" | "pending validation";
  step_output: string | object;
}

export interface AppData {
  content_sub_types: ContentSubType[];
  examples: Example[];
  content_outputs: ContentOutput[];
  blog_metadata: BlogMetadata[];
  content_generation_user_input: ContentGenerationUserInput[];
  token_usage: TokenUsage[];
  step_outputs: StepOutput[];
  validations: Validations[];
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
