// src/validationHandler.ts

import { dataAccess } from './dataAccess';
import { ContentOutput, StepOutput } from '@shared/backendTypes';

export async function getPendingValidations(): Promise<ContentOutput[]> {
  return await dataAccess.getPendingValidationOutputs();
}

export async function getPendingSteps(contentOutputId: number): Promise<StepOutput[]> {
  return await dataAccess.OLD_getPendingValidationItems(contentOutputId);
}

export async function validateSingleStep(stepOutputId: number, validationData: any): Promise<void> {
  const stepOutput = await dataAccess.getStepOutputById(stepOutputId);
  if (!stepOutput) {
    throw new Error(`Step output with id ${stepOutputId} not found`);
  }

  await dataAccess.updateStepOutput(stepOutputId, "completed", validationData);

  // Handle specific step output types
  if (stepOutput.step_output_type === "final_content") {
    // Update the content in content_output
    await dataAccess.updateContentOutput(stepOutput.content_output_id, validationData);
  } else if (stepOutput.step_output_type.startsWith("final_BM_")) {
    // final_BM_ is blog metadata - Extract the metadata field name - it's everything after the second underscore
    const metadataField = stepOutput.step_output_type.split("_").slice(2).join("_");
    // Update or create blog metadata
    const existingMetadata = await dataAccess.getBlogMetadataByContentOutputId(stepOutput.content_output_id);
    if (existingMetadata) {
      // Update existing metadata
      await dataAccess.updateBlogMetadata(existingMetadata.id, { [metadataField]: validationData });
      // console log for debug
      const updatedMetadata = await dataAccess.getBlogMetadataById(existingMetadata.id);
      console.log(`Blog metadata updated:`, updatedMetadata);
    } else {
      // Create new metadata
      const metaID = await dataAccess.saveBlogMetadata({
        content_output_id: stepOutput.content_output_id,
        [metadataField]: validationData
      });
      // console log for debug
      const newMetadata = await dataAccess.getBlogMetadataById(metaID);
      console.log(`New blog metadata created:`, newMetadata);
    }
  }
}

export async function checkAndUpdateContentOutputStatus(contentOutputId: number): Promise<void> {
  const updatedSteps = await dataAccess.OLD_getPendingValidationItems(contentOutputId);
  const allStepsCompleted = updatedSteps.every(step => step.step_status === "completed");

  if (allStepsCompleted) {
    await dataAccess.updateContentOutput(contentOutputId, undefined, "completed");
  }

  // console log for debug
  const updatedContentOutput = await dataAccess.getContentOutputById(contentOutputId);
  console.log(`Content output ${contentOutputId} updated:`, updatedContentOutput);
}
