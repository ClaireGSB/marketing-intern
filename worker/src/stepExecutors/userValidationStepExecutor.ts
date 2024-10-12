import { UserValidationStepConfig, StepResponse, ProjectSettings, SubtypeSettings } from '../recipeTypes';


export async function executeUserValidationStep(
  stepConfig: UserValidationStepConfig,
  content: any,
  recipeConfig: ProjectSettings,
  recipeData: SubtypeSettings
): Promise<StepResponse> {
  const options = stepConfig.options(content);

  return {
    status: 'success',
    output: 'PENDING_VALIDATION',
    fullResponse: {
      pendingValidation: true,
      options: options
    }
  };
}
