// src/recipeTypes.ts
import type { ContentSubType, Example } from '../../types/backendTypes';

export interface ProjectSettings {
  [key: string]: any;
  // componentType?: 'outline' | 'full_content';
  // TODO: Standardize the project settings here so we don't have to do it in the Recipe
}

export interface SubtypeSettings {
  // contentType: ContentType | undefined;
  contentSubType: ContentSubType;
  context: string | null;
  // processedContext: string;
  guidelines: string | null;
  // processedGuidelines: string;
  // productContext: string;
  // contentStrategy: string;
  // outlineGuidelines: string;
  // copyGuidelines: string;
  examples: Example[];
  processedExamples: string;
  goodExamples: Example[];
  badExamples: Example[];
}

export type StepType = 'llm' | 'nativishAPI' | 'nativishHtmlRender' | 'screenshot' | 'cliSelection' | 'jsonParse' | 'userValidation';

// Base configuration for all steps
export type BaseStepConfig = {
  stepName: string;
  outputType: string;
  condition?: (config: ProjectSettings) => boolean;
  fallbackValue?: (config: ProjectSettings) => string;
};

// additional configuration for each step type
export type LLMStepConfig = BaseStepConfig & {
  stepType: 'llm';
  model: string;
  temperature?: number;
  outputJSON?: boolean;
  systemPromptTemplate: (projectSettings: ProjectSettings, subTypeSettings: SubtypeSettings) => string;
  userContentTemplate: (content: Record<string, any>, projectSettings: ProjectSettings, subTypeSettings: SubtypeSettings) => string;
  handleTokenUsage?: (tokenUsage: TokenUsage) => void;
};

export type NativishAPIStepConfig = BaseStepConfig & {
  stepType: 'nativishAPI';
  inputText: (projectSettings: ProjectSettings) => string;
};

export type NativishHtmlRenderStepConfig = BaseStepConfig & {
  stepType: 'nativishHtmlRender';
  inputJsonKey: string;
};

export type ScreenshotStepConfig = BaseStepConfig & {
  stepType: 'screenshot';
  htmlFilePath: string;
  dataKey: string;
};

export type CLISelectionStepConfig = BaseStepConfig & {
  stepType: 'cliSelection';
  options: (content: Record<string, any>) => Record<string, string>;
  promptText?: string;
  followUpPrompt?: string;
};

export type JSONParseStepConfig = BaseStepConfig & {
  stepType: 'jsonParse';
  inputKey: string;
};

export type UserValidationStepConfig = BaseStepConfig & {
  stepType: 'userValidation';
  options: (content: Record<string, any>) => Record<string, string>;
};

export type RecipeStepConfig = LLMStepConfig | NativishAPIStepConfig | NativishHtmlRenderStepConfig | ScreenshotStepConfig | CLISelectionStepConfig | JSONParseStepConfig | UserValidationStepConfig;

export interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
}

export interface TokenUsageRecord extends TokenUsage {
  id: number;
  user_id: number;
  content_output_id: number;
}

export type StepResponse = {
  status: 'success' | 'failed';
  error?: Error;
  fullResponse?: any;
  output?: string;
  tokenUsage?: TokenUsage;
};

export type StepExecutor<T extends RecipeStepConfig> = (
  stepConfig: T,
  content: Record<string, any>,
  recipeConfig: ProjectSettings,
  subtypeSettings: SubtypeSettings
) => Promise<StepResponse>;

export type StepExecutors = {
  [K in StepType]: StepExecutor<Extract<RecipeStepConfig, { stepType: K }>>;
};

export type StepReport = {
  stepName: string;
  index: number;
  status: "not started" | "in progress" | "completed" | "failed" | "skipped" | "pending validation";
  error?: Error;
  fullResponse?: any;
  output?: string;
};

export interface Recipe<T extends ProjectSettings, O extends string, D extends SubtypeSettings> {
  contentType: string;
  componentType?: 'outline' | 'full_content';
  steps: RecipeStepConfig[];
  outputTypes: readonly O[];
}

export interface UserInput<T extends ProjectSettings> {
  config: T;
}
