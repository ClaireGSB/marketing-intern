// types/frontendTypes.ts

export interface Users {
  id: string;
  // org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  is_org_admin: boolean;
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
  id: string;
  content_subtype_id: string | null;
  example_type: string;
  name: string;
  content: string | null;
  explanation: string | null;
}

export interface ContentOutput {
  id: string;
  created_by: string;
  content_type_id: number;
  content_subtype_id: string | null;
  content: string;
  created_at: string;
  status: 'generating' | 'pending validation' | 'completed' | 'scheduled' | 'published' | 'failed';
  project_setup_id?: string;
}

export interface BlogMetadata {
  id: string;
  content_output_id: string;
  title_options?: string[];
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
  id?: string;
  content_type_id: number;
  content_subtype_id: string;
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
  id: string;
  content_output_id: string;
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
