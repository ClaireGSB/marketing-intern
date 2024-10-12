// src/dataAccess.ts

import fs from 'fs/promises';
import path from 'path';
import { processExamples, processBadExamples, processGoodExamples } from './dataProcessors/exampleProcessor';
import * as BackendTypes from '../../types/backendTypes';
import * as FrontendTypes from '../../types/frontendTypes';
import { examples } from '../../server/db/examples'
import { validations } from '../../server/db/validations'
import { tokenUsage } from '~/server/db/tokenUsages';
import { stepOutput } from '~/server/db/stepOutputs';
import { contentOutputs } from '~/server/db/contentOutputs';
import { blogMetadatas } from '~/server/db/blogMetadatas';
class DataAccess {

  // async getContentSubTypeByName(userID: number, contentSubTypeName: string): Promise<BackendTypes.ContentSubType | undefined> {
  //   const data = await this.loadData();
  //   const isMatchingConditions = (cst: BackendTypes.ContentSubType) => cst.name === contentSubTypeName && (cst.created_by === userID || !cst.created_by) && !cst.deleted_at;
  //   const matchingSubType = data.content_sub_types.find(isMatchingConditions);
  //   return matchingSubType;
  // }

  async getExamples(contentSubTypeId: string): Promise<BackendTypes.Example[]> {
    const exampleList = await examples.getByContentSubtypeId(contentSubTypeId);
    return exampleList;
  }

  // async getContentOutputs(userID: number, contentTypeId: number): Promise<BackendTypes.ContentOutput[]> {
  //   const data = await this.loadData();
  //   const isMatchingConditions = (co: BackendTypes.ContentOutput) =>
  //     co.content_type_id === contentTypeId &&
  //     co.created_by === userID;
  //   return data.content_outputs.filter(isMatchingConditions);
  // }

  // async fetchSettingsBySubtype(userID: number, contentSubTypeName: string): Promise<any> {
  //   const contentSubType = await this.getContentSubTypeByName(userID, contentSubTypeName);
  //   if (!contentSubType) {
  //     throw new Error(`Content subtype ${contentSubTypeName} not found`);
  //   }
  //   const context = contentSubType ? contentSubType.context : null;
  //   const guidelines = contentSubType ? contentSubType.guidelines : null;
  //   const examples = await this.getExamples(contentSubType.id);

  //   const settings = {
  //     // contentType,
  //     contentSubType,
  //     context,
  //     guidelines,
  //     examples,
  //     processedExamples: processExamples(examples),
  //     goodExamples: processGoodExamples(examples),
  //     badExamples: processBadExamples(examples),
  //     // processedContext: processContext(context),
  //     // processedGuidelines: processGuidelines(guidelines),
  //     // productContext: context.find(c => c.context_type === 'product_description')?.context_content || '',
  //     // contentStrategy: context.find(c => c.context_type === 'content_strategy')?.context_content || '',
  //     // outlineGuidelines: guidelines.find(g => g.guideline_type === 'outline_guidelines')?.guideline_content || '',
  //     // copyGuidelines: guidelines.find(g => g.guideline_type === 'copy_guidelines')?.guideline_content || ''
  //   };

  //   return settings;
  // }

  // async saveContentOutput(
  //   userID: number,
  //   contentTypeId: number,
  //   contentSubTypeId: number | null,
  //   // componentType: 'outline' | 'full_content',
  //   // parentOutlineId: number | null = null
  // ): Promise<number> {
  //   const data = await this.loadData();
  //   const newId = Math.max(...data.content_outputs.map(co => co.id), 0) + 1;
  //   const newContentOutput: BackendTypes.ContentOutput = {
  //     id: newId,
  //     created_by: userID,
  //     content_type_id: contentTypeId,
  //     content_subtype_id: contentSubTypeId,
  //     original_content_id: newId,
  //     version_number: 1,
  //     content: '',
  //     created_at: new Date().toISOString(),
  //     // component_type: componentType,
  //     status: 'generating',
  //     is_current_version: true,
  //     // parent_outline_id: parentOutlineId,
  //   };
  //   data.content_outputs.push(newContentOutput);
  //   await this.saveData(data);
  //   return newId;
  // }

  // async saveContentGenerationUserInput(contentOutputId: number, userID: number, config: Record<string, any>): Promise<void> {
  //   const data = await this.loadData();
  //   const newInputs = Object.entries(config).map(([key, value], index) => ({
  //     id: Math.max(...data.content_generation_user_input.map(input => input.id), 0) + index + 1,
  //     content_output_id: contentOutputId,
  //     user_id: userID,
  //     parameter_name: key,
  //     parameter_value: String(value)
  //   }));
  //   data.content_generation_user_input.push(...newInputs);
  //   await this.saveData(data);
  // }

  async updateContentOutput(
    id: string,
    content?: string,
    status?: BackendTypes.ContentOutput['status']
  ): Promise<BackendTypes.ContentOutput> {
    // Prepare the update object
    const updates: Partial<BackendTypes.ContentOutput> = {};
    if (content !== undefined) {
      updates.content = content;
    }
    if (status !== undefined) {
      updates.status = status;
    }

    // Update the content output in the database
    const updatedContentOutput = await contentOutputs.update(id, updates);
    if (!updatedContentOutput) {
      throw new Error(`Content output with id ${id} not found`);
    }

    return updatedContentOutput;
  }

  async saveBlogMetadata(metadata: Partial<BackendTypes.BlogMetadata> & { content_output_id: string }): Promise<BackendTypes.BlogMetadata> {
    // Prepare the blog metadata object
    const newMetadata: Omit<BackendTypes.BlogMetadata, 'id'> = {
      content_output_id: metadata.content_output_id,
      title_options: metadata.title_options || [],
      title: metadata.title || '',
      meta_description: metadata.meta_description || '',
      formatted_post: metadata.formatted_post || ''
    };

    // Create the blog metadata entry in the database
    const createdMetadata = await blogMetadatas.create(metadata.content_output_id, newMetadata);

    return createdMetadata;
  }

  async getBlogMetadataByContentOutputId(contentOutputId: string): Promise<BackendTypes.BlogMetadata | null> {
    return await blogMetadatas.getBlogMetadataByContentOutputId(contentOutputId);
  }

  // async getBlogMetadataById(id: number): Promise<BackendTypes.BlogMetadata | undefined> {
  //   const data = await this.loadData();
  //   return data.blog_metadata.find(bm => bm.id === id);
  // }

  async updateBlogMetadata(id: string, updates: Partial<BackendTypes.BlogMetadata>): Promise<BackendTypes.BlogMetadata> {
    const updatedMetadata = await blogMetadatas.update(id, updates);

    if (!updatedMetadata) {
      throw new Error(`Blog metadata with id ${id} not found`);
    }

    return updatedMetadata;
  }

  async saveStepOutput(stepOutputData: Omit<BackendTypes.StepOutput, 'id'>): Promise<string> {
    const newStepOutput = await stepOutput.create(stepOutputData);
    return newStepOutput.id;
  }
  
  // async getStepOutputById(id: string): Promise<BackendTypes.StepOutput | null> {
  //   return await stepOutput.getStepOutputByID(id);
  // }
  
  async updateStepOutput(
    stepOutputId: string, 
    status: BackendTypes.StepOutput['step_status'], 
    output: any
  ): Promise<BackendTypes.StepOutput> {
    const updatedStepOutput = await stepOutput.update(stepOutputId, status, output);
  
    if (!updatedStepOutput) {
      throw new Error(`Step output with id ${stepOutputId} not found`);
    }
  
    return updatedStepOutput;
  }

  // async getContentOutputById(id: number): Promise<BackendTypes.ContentOutput | undefined> {
  //   const data = await this.loadData();
  //   return data.content_outputs.find(co => co.id === id);
  // }

  async createValidationItem(org_id: string, user_id: string, contentOutputId: string, stepOutputType: string, options: Record<string, string>): Promise<BackendTypes.Validations> {

    const newValidationData = {
      // Use 0 as the default value if data.validations is empty
      org_id: org_id,
      content_output_id: contentOutputId,
      step_output_type: stepOutputType,
      validation_status: 'pending' as const,
      options,
      feedback: {},
      selected_option: '',
      updated_by: user_id
    };
    const newValidation = await validations.create(newValidationData);
    return newValidation;
  }

  // async getPendingValidationOutputs(): Promise<BackendTypes.ContentOutput[]> {
  //   const data = await this.loadData();
  //   return data.content_outputs.filter(co => co.status === "pending validation");
  // }

  // using new structure
  async getValidationItems(contentOutputId: string): Promise<FrontendTypes.Validations[]> {
    const data = await validations.getValidationsByContentOutputID(contentOutputId);
    const items = data.map(({ created_at, updated_at, updated_by, ...rest }) => rest);
    return items;
  }

  // async getValidationItemByID(validationID: number): Promise<FrontendTypes.Validations> {
  //   const data = await this.loadData();
  //   const item = data.validations.find(v => v.id === validationID);
  //   if (!item) {
  //     throw new Error(`Validation item with id ${validationID} not found`);
  //   }
  //   const { created_at, updated_at, updated_by, ...rest } = item;
  //   return rest;
  // }

  // async getPendingValidationItems(contentOutputId: number): Promise<FrontendTypes.Validations[]> {
  //   const data = await this.loadData();
  //   const items = data.validations
  //     .filter(v => v.content_output_id === contentOutputId && v.validation_status === "pending")
  //     // Exclude the fields not part of the Frontent Validations interface
  //     .map(({ created_at, updated_at, updated_by, ...rest }) => rest);
  //   return items;
  // }

  async updateValidationItem(user_id: string, validationItem: FrontendTypes.Validations): Promise<void> {

    // Prepare the update object
    const updateData: Partial<BackendTypes.Validations> = {
      selected_option: validationItem.selected_option,
      feedback: validationItem.feedback,
      validation_status: validationItem.validation_status,
      updated_by: user_id
    };

    // Update the validation item in the database
    const updatedValidation = await validations.update(validationItem.id, updateData);

    if (!updatedValidation) {
      throw new Error(`Validation item with id ${validationItem.id} not found`);
    }
  }

  async checkIfAllValidationsCompleted(contentOutputId: string): Promise<boolean> {
    const nonCompletedValidations = await validations.getNonCompletedValidationsByContentOutputID(contentOutputId);
    return nonCompletedValidations.length === 0;
  }



  // async confirmValidations(contentOutputID: string): Promise<FrontendTypes.ContentOutput> {
  //   const contentOutput = await contentOutputs.getContentOutputById(contentOutputID);
  //   if (!contentOutput) {
  //     throw new Error(`Content output with id ${contentOutputID} not found`);
  //   }
  //   if (await this.checkIfAllValidationsCompleted(contentOutputID)) {
  //     contentOutput.status = 'completed';
  //     // update content with selected option of the validationItem with step output 'final_content'
  //     contentOutput.content = data.validations.find(
  //       v => v.content_output_id === contentOutputID &&
  //         v.step_output_type === 'final_content'
  //     )?.selected_option || '';
  //     // update blog metadata with selected option of all the validation items that start with 'final_BM_'
  //     data.validations
  //       .filter(v => v.content_output_id === contentOutputID && v.step_output_type.startsWith('final_BM_'))
  //       .forEach(v => {
  //         const metadataField = v.step_output_type.split('_').slice(2).join('_');
  //         const metadata = data.blog_metadata.find(bm => bm.content_output_id === contentOutputID);
  //         if (metadata) {
  //           this.updateBlogMetadata(metadata.id, { [metadataField]: v.selected_option });
  //         } else {
  //           throw new Error(`Blog metadata for content output with id ${contentOutputID} not found`);
  //         }
  //       });

  //   } else {
  //     throw new Error(`Not all validations for content output with id ${contentOutputID} are completed`);
  //   }
  //   await this.saveData(data);
  //   const updatedContentOutput = await this.getContentOutputById(contentOutputID);
  //   if (!updatedContentOutput) {
  //     throw new Error(`Content output with id ${contentOutputID} not found`);
  //   }
  //   return updatedContentOutput;
  // }


  // async OLD_getPendingValidationItems(contentOutputId: number): Promise<BackendTypes.StepOutput[]> {
  //   const data = await this.loadData();
  //   return data.step_outputs.filter(so => so.content_output_id === contentOutputId && so.step_status === "pending validation");
  // }

  async saveTokenUsage(tokenUsageData: {
    org_id: string;
    content_output_id: string;
    step_output_id: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
  }): Promise<BackendTypes.TokenUsage> {
    // Prepare the token usage object
    const newTokenUsage: Omit<BackendTypes.TokenUsage, 'id'> = {
      org_id: tokenUsageData.org_id,
      content_output_id: tokenUsageData.content_output_id,
      step_output_id: tokenUsageData.step_output_id,
      model: tokenUsageData.model,
      input_tokens: tokenUsageData.input_tokens,
      output_tokens: tokenUsageData.output_tokens
    };

    // Create the token usage entry in the database
    const createdTokenUsage = await tokenUsage.create(newTokenUsage);

    return createdTokenUsage;
  }

  // private async saveData(data: BackendTypes.AppData): Promise<void> {
  //   await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  // }
}

export const dataAccess = new DataAccess();
