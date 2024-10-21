// types/backendTypes.ts

export interface Users {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_admin: boolean;
  is_org_admin: boolean;
}

export interface Organizations {
  id: string;
  name: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ContentSubType {
  id: string;
  org_id: string;
  content_type_id: number;
  name: string;
  context: string | null;
  guidelines: string | null;
  target_audience: string | null;
  created_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface Example {
  id: string;
  org_id: string
  created_by: string;
  updated_by: string;
  content_subtype_id: string | null;
  content_output_id?: string;
  example_type: string;
  name: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  explanation: string | null;
}

export interface ContentOutput {
  id: string;
  org_id: string;
  created_by: string;
  content_type_id: number;
  content_subtype_id: string | null;
  // original_content_id: number | null;
  // version_number: number;
  content: string;
  created_at: string;
  updated_at: string;
  status: 'generating' | 'pending validation' | 'completed' | 'scheduled' | 'published' | 'failed';
  // is_current_version: boolean;
  project_setup_id?: string;
  subtype_settings_history_id?: string;
}

export interface BlogMetadata {
  id: string;
  content_output_id: string;
  title_options?: string[];
  title?: string;
  meta_description: string;
  formatted_post?: string;
}

export interface Validations {
  id: string;
  org_id: string;
  content_output_id: string;
  step_output_type: string;
  validation_status: "pending" | "completed";
  options: Record<string, string>;
  feedback: Record<string, string>;
  selected_option: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
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
  id: string;
  org_id: string;
  content_output_id: string;
  step_output_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
}

export interface StepOutput {
  id: string;
  index: number;
  content_output_id: string;
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
  id?: string;
  content_type_id: number;
  content_subtype_id: string;
  action: string;
  topic?: string;
  ideas?: string;
  target_audience?: string;
  guidelines?: string;
  context?: string;
  content?: string;
  selected_content_output_id?: string;
  selected_content_type?: string;
  selected_content_blog_metadata?: BlogMetadata;
  repurpose_instructions?: string;
  expertise?: string;
  seo_phrase?: string;
  outline?: string;
  selected_outline_id?: string;

}

export interface SettingsInputWithoutExamples {
  name: string;
  target_audience?: string;
  guidelines?: string;
  context?: string;
}


export interface SettingsInput {
  id?: string;
  name: string;
  target_audience?: string;
  guidelines?: string;
  context?: string;
  examples: Example[];
}

export interface Campaign {
  id: string;
  org_id: string;
  name: string;
  action: string;
  guidelines?: string;
  context?: string;
  action_inputs: object;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  deleted_at: string | null;
  }