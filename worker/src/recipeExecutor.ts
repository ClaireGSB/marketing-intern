// src/recipeExecutor.ts

import type {
  RecipeStepConfig,
  StepType,
  StepExecutors,
  StepResponse,
  TokenUsage,
  StepReport,
  LLMStepConfig,
  NativishAPIStepConfig,
  NativishHtmlRenderStepConfig,
  SubtypeSettings,
  Recipe
} from './recipeTypes';
import type { UserInput } from '~/types/backendTypes';
import { executeLLMStep } from './stepExecutors/llmStepExecutor';
import { executeNativishApiStep } from './stepExecutors/nativishAPIStepExecutor';
import { executeNativishHtmlRenderStep } from './stepExecutors/nativishHtmlRenderStepExecutor';
import { executeScreenshotStep } from './stepExecutors/screenshotGenerator';
import { executeCLISelectionStep } from './stepExecutors/cliSelectionStepExecutor';
import { executeJSONParseStep } from './stepExecutors/jsonParseStepExecutor';
import { executeUserValidationStep } from './stepExecutors/userValidationStepExecutor';
import { dataAccess } from './dataAccess';


const stepExecutors: StepExecutors = {
  llm: executeLLMStep,
  nativishAPI: executeNativishApiStep,
  nativishHtmlRender: executeNativishHtmlRenderStep,
  screenshot: executeScreenshotStep,
  cliSelection: executeCLISelectionStep,
  jsonParse: executeJSONParseStep,
  userValidation: executeUserValidationStep
};

// Main class for executing a series of steps in a recipe
export class recipeExecutor {
  // Store reports for each step
  private stepReports: StepReport[] = [];
  // Store the overall recipe configuration
  private recipeConfig: UserInput;
  // Store the content generated throughout the recipe execution
  private content: { [key: string]: string } = {};
  // Store the id of the content output
  private contentOutputId: string = '';
  // Store the org ID
  private orgID: string = '';
  // Store the user ID
  private userID: string = '';

  // Constructor initializes the executor with default empty objects
  // The actual initialization happens in the executeRecipe method
  constructor(recipeConfig: UserInput, initialContent: { [key: string]: string }) {
    this.recipeConfig = recipeConfig;
    this.content = initialContent;
  }

  private async saveTokenUsage(tokenUsage: TokenUsage, step_output_id: string) {
    if (this.contentOutputId) {
      await dataAccess.saveTokenUsage({
        org_id: this.orgID,
        content_output_id: this.contentOutputId,
        step_output_id,
        ...tokenUsage
      });
    }
  }

  private async saveFinalContent(stepOutput: string, stepOutputType: string, stepOutputStatus: string) {
    if (!this.contentOutputId) {
      throw new Error("Content output ID is not set");
    }
    // if stepOutputType starts with "final_"
    if (stepOutputStatus === "completed" && stepOutputType.startsWith("final_")) {
      // if stepOutputType is final_content, update content output
      if (stepOutputType === "final_content") {
        if (this.contentOutputId) {
          await dataAccess.updateContentOutput(this.contentOutputId, stepOutput, stepOutputStatus);
        }
      } else {
        // if stepOutputType starts with "final_BM_"
        if (stepOutputType.startsWith("final_BM_")) {
          // Extract the metadata field name - it's everything after the second underscore
          const metadataField = stepOutputType.split("_").slice(2).join("_");
          // Update or create blog metadata
          const existingMetadata = await dataAccess.getBlogMetadataByContentOutputId(this.contentOutputId);
          if (existingMetadata) {
            // Update existing metadata
            await dataAccess.updateBlogMetadata(existingMetadata.id, { [metadataField]: stepOutput });
          } else {
            // Create new metadata
            const newMDId = await dataAccess.saveBlogMetadata({
              content_output_id: this.contentOutputId,
              [metadataField]: stepOutput
            });
          }
        }
      }
    }
  }


  // Initialize step reports based on the provided recipe steps
  initializeStepReports(recipeSteps: RecipeStepConfig[]) {
    this.stepReports = recipeSteps.map((config, index) => ({
      stepName: config.stepName,
      index,
      status: "not started",
    }));
  }

  // Execute a single step in the recipe
  private async executeStep(stepIndex: number, stepConfig: RecipeStepConfig, recipeData: SubtypeSettings): Promise<void> {
    this.stepReports[stepIndex].status = "in progress";
    let stepStatus: "completed" | "failed" | "skipped" | "pending validation" = "completed";
    let stepOutput: string | object = "";
    let tokenUsage: TokenUsage | undefined;

    try {
      // Check if the step should be skipped
      if ('condition' in stepConfig && typeof stepConfig.condition === 'function' && !stepConfig.condition(this.recipeConfig)) {
        if ('fallbackValue' in stepConfig && typeof stepConfig.fallbackValue === 'function') {
          const fallbackValue = stepConfig.fallbackValue(this.recipeConfig);
          this.stepReports[stepIndex].status = "skipped";
          this.stepReports[stepIndex].output = fallbackValue;
          this.content[stepConfig.outputType] = fallbackValue;
          stepStatus = "skipped";
          stepOutput = fallbackValue;
        } else {
          this.stepReports[stepIndex].status = "skipped";
          stepStatus = "skipped";
        }
      } else {
        // Execute the step
        const response: StepResponse = await stepExecutors[stepConfig.stepType](
          stepConfig as any,
          this.content,
          this.recipeConfig,
          recipeData
        );

        if (response.status === "failed") {
          this.stepReports[stepIndex].status = "failed";
          this.stepReports[stepIndex].error = response.error;
          console.error(`Failed to complete step ${stepIndex}: ${this.stepReports[stepIndex].stepName}`, response.error);
          stepStatus = "failed";
          stepOutput = response.error?.message || "Unknown error";
        } else {
          this.stepReports[stepIndex].fullResponse = response.fullResponse;
          this.stepReports[stepIndex].output = response.output;

          if (response.output === 'PENDING_VALIDATION') {
            stepStatus = "pending validation";
            this.stepReports[stepIndex].status = "pending validation";
            stepOutput = {
              status: "pending validation",
              options: response.fullResponse.options
            };
            // Create validation item
            console.log("Creating validation item for step", stepIndex);
            console.log('this.orgID', this.orgID);
            console.log('this.userID', this.userID);
            console.log('this.contentOutputId', this.contentOutputId);
            console.log('stepConfig.outputType', stepConfig.outputType);
            console.log('response.fullResponse.options', response.fullResponse.options);
            await dataAccess.createValidationItem(this.orgID, this.userID, this.contentOutputId, stepConfig.outputType, response.fullResponse.options);
          } else {
            stepStatus = "completed";
            this.stepReports[stepIndex].status = "completed";
            this.content[stepConfig.outputType] = response.output || "";
            stepOutput = this.content[stepConfig.outputType];
          }


          // Store token usage if it's an LLM step
          if (stepConfig.stepType === 'llm' && 'tokenUsage' in response && response.tokenUsage) {
            tokenUsage = response.tokenUsage;
          }
        }
      }

      // log step completion
      console.log("--------------------------------------------------");
      console.log(`Completed step ${stepIndex}: ${stepConfig.stepName}`);
      console.log(`Output (${stepConfig.outputType}):`,
        typeof stepOutput === 'string'
          ? stepOutput.substring(0, 100) + '...'
          : JSON.stringify(stepOutput).substring(0, 100) + '...'
      );
      console.log("--------------------------------------------------\n\n");

    } catch (error) {
      console.error(`Failed to complete step ${stepIndex}: ${this.stepReports[stepIndex].stepName}`, error);
      this.stepReports[stepIndex].status = "failed";
      this.stepReports[stepIndex].error = error instanceof Error ? error : new Error(String(error));
      stepOutput = error instanceof Error ? error.message : "Unknown error";
      stepStatus = "failed";
    }

    // Save step output
    let stepOutputId: string | undefined;
    if (this.contentOutputId) {
      stepOutputId = await dataAccess.saveStepOutput({
        index: stepIndex,
        content_output_id: this.contentOutputId,
        step_name: stepConfig.stepName,
        step_output_type: stepConfig.outputType,
        step_status: stepStatus,
        step_output: stepOutput
      });
    }

    // Save final content if step is completed and starts with "final_"
    if (stepStatus === "completed" && stepConfig.outputType.startsWith("final_")) {
      await this.saveFinalContent(stepOutput as string, stepConfig.outputType, stepStatus);
    }

    // Save token usage if available
    if (tokenUsage && stepOutputId) {
      await this.saveTokenUsage(tokenUsage, stepOutputId);
    }

    // Throw an error if the step failed so that the recipe execution stops
    if (stepStatus === "failed") {
      throw new Error(`Step ${stepIndex}: ${stepConfig.stepName} failed`);
    }
  }

  // Main method to execute the entire recipe
  // This method uses generics to allow for flexible typing of configurations and outputs
  async executeRecipe<T extends UserInput, O extends string>(
    recipe: Recipe<T, O, SubtypeSettings>,
    contentOutputId: string,
    userID: string,
    orgID: string,
    projectSettings: T,
    subtypeSettings: SubtypeSettings
  ): Promise<{ [K in O]: string }> {
    // T is a type parameter that extends RecipeConfig, allowing for specific recipe configurations
    // O is a type parameter that extends string, used for the output types

    console.log('executeRecipe Starting in Recipe Executor.');


    // Store the org ID and user ID and content output ID
    this.contentOutputId = contentOutputId;
    this.orgID = orgID;
    this.userID = userID;


    // Initialize the content with empty strings for each output type
    const initialContent = Object.fromEntries(
      recipe.outputTypes.map(key => [key, ""])
    ) as { [K in O]: string };

    // Set the recipe configuration and initial content
    this.recipeConfig = projectSettings;
    this.content = initialContent;

    // Initialize step reports for all steps in the recipe
    this.initializeStepReports(recipe.steps);

    try {
      // Execute each step in order
      for (let stepIndex = 0; stepIndex < recipe.steps.length; stepIndex++) {
        const stepConfig = recipe.steps[stepIndex];
        await this.executeStep(stepIndex, stepConfig, subtypeSettings);

        if (this.stepReports[stepIndex].status === "failed") {
          throw new Error(`Recipe execution failed at step ${stepIndex}: ${stepConfig.stepName}`);
        }
      }
    } catch (error) {
      console.error(`Recipe execution failed:`, error);
      // Perform any necessary cleanup here
      // update database with error status
      if (contentOutputId) {
        await dataAccess.updateContentOutput(contentOutputId, undefined, "failed");
      }
      throw error;
    }

    console.log(`Recipe execution completed successfully!`);

    const hasPendingValidation = this.stepReports.some(report => report.status === "pending validation");
    const finalStatus = hasPendingValidation ? "pending validation" : "completed";


    // Update content output with final status
    if (contentOutputId) {
      await dataAccess.updateContentOutput(contentOutputId, undefined, finalStatus);
    }

    // Return the final content after executing all steps
    // The return type is a mapped type where each key in O maps to a string value
    return this.content as { [K in O]: string };
  }

}
