// src/dataAccess.ts

import fs from 'fs/promises';
import path from 'path';
import { processExamples, processBadExamples, processGoodExamples } from './dataProcessors/exampleProcessor';
import * as BackendTypes from '@shared/backendTypes';
import * as FrontendTypes from '@shared/frontendTypes';

class DataAccess {
  private dataFilePath: string;

  constructor(dataFileName: string) {
    this.dataFilePath = path.resolve(__dirname, '..', '..', '..', dataFileName);
  }

  private async loadData(): Promise<BackendTypes.AppData> {
    try {
      const data = JSON.parse(await fs.readFile(this.dataFilePath, 'utf-8'));
      return data;
    } catch (error) {
      console.error('Error loading app data:', error);
      throw error;
    }
  }

  async getContentSubTypeByName(userID: number, contentSubTypeName: string): Promise<BackendTypes.ContentSubType | undefined> {
    const data = await this.loadData();
    const isMatchingConditions = (cst: BackendTypes.ContentSubType) => cst.name === contentSubTypeName && (cst.created_by === userID || !cst.created_by) && !cst.deleted_at;
    const matchingSubType = data.content_sub_types.find(isMatchingConditions);
    return matchingSubType;
  }

  async getExamples(userID: number, contentSubTypeId: number): Promise<BackendTypes.Example[]> {
    const data = await this.loadData();
    const isMatchingConditions = (e: BackendTypes.Example) =>
      e.content_subtype_id === contentSubTypeId &&
      e.created_by === userID &&
      !e.deleted_at;
    const matchingExamples = data.examples.filter(isMatchingConditions);
    return matchingExamples;
  }

  async getContentOutputs(userID: number, contentTypeId: number): Promise<BackendTypes.ContentOutput[]> {
    const data = await this.loadData();
    const isMatchingConditions = (co: BackendTypes.ContentOutput) =>
      co.content_type_id === contentTypeId &&
      co.created_by === userID;
    return data.content_outputs.filter(isMatchingConditions);
  }

  async fetchSettingsBySubtype(userID: number, contentSubTypeName: string): Promise<any> {
    const contentSubType = await this.getContentSubTypeByName(userID, contentSubTypeName);
    if (!contentSubType) {
      throw new Error(`Content subtype ${contentSubTypeName} not found`);
    }
    const context = contentSubType ? contentSubType.context : null;
    const guidelines = contentSubType ? contentSubType.guidelines : null;
    const examples = await this.getExamples(userID, contentSubType.id);

    const settings = {
      // contentType,
      contentSubType,
      context,
      guidelines,
      examples,
      processedExamples: processExamples(examples),
      goodExamples: processGoodExamples(examples),
      badExamples: processBadExamples(examples),
      // processedContext: processContext(context),
      // processedGuidelines: processGuidelines(guidelines),
      // productContext: context.find(c => c.context_type === 'product_description')?.context_content || '',
      // contentStrategy: context.find(c => c.context_type === 'content_strategy')?.context_content || '',
      // outlineGuidelines: guidelines.find(g => g.guideline_type === 'outline_guidelines')?.guideline_content || '',
      // copyGuidelines: guidelines.find(g => g.guideline_type === 'copy_guidelines')?.guideline_content || ''
    };

    return settings;
  }

  async saveContentOutput(
    userID: number,
    contentTypeId: number,
    contentSubTypeId: number | null,
    // componentType: 'outline' | 'full_content',
    // parentOutlineId: number | null = null
  ): Promise<number> {
    const data = await this.loadData();
    const newId = Math.max(...data.content_outputs.map(co => co.id), 0) + 1;
    const newContentOutput: BackendTypes.ContentOutput = {
      id: newId,
      created_by: userID,
      content_type_id: contentTypeId,
      content_subtype_id: contentSubTypeId,
      original_content_id: newId,
      version_number: 1,
      content: '',
      created_at: new Date().toISOString(),
      // component_type: componentType,
      status: 'generating',
      is_current_version: true,
      // parent_outline_id: parentOutlineId,
    };
    data.content_outputs.push(newContentOutput);
    await this.saveData(data);
    return newId;
  }

  async saveContentGenerationUserInput(contentOutputId: number, userID: number, config: Record<string, any>): Promise<void> {
    const data = await this.loadData();
    const newInputs = Object.entries(config).map(([key, value], index) => ({
      id: Math.max(...data.content_generation_user_input.map(input => input.id), 0) + index + 1,
      content_output_id: contentOutputId,
      user_id: userID,
      parameter_name: key,
      parameter_value: String(value)
    }));
    data.content_generation_user_input.push(...newInputs);
    await this.saveData(data);
  }

  async updateContentOutput(
    id: number,
    content?: string,
    status?: BackendTypes.ContentOutput['status']
  ): Promise<void> {
    const data = await this.loadData();
    const contentOutput = data.content_outputs.find(co => co.id === id);
    if (contentOutput) {
      if (content !== undefined) {
        contentOutput.content = content;
      }
      if (status !== undefined) {
        contentOutput.status = status;
      }
      await this.saveData(data);
    } else {
      throw new Error(`Content output with id ${id} not found`);
    }
  }

  async saveBlogMetadata(metadata: Partial<BackendTypes.BlogMetadata> & { content_output_id: number }): Promise<number> {
    const data = await this.loadData();
    if (!data.blog_metadata) {
      data.blog_metadata = [];
    }
    const newId = Math.max(...data.blog_metadata.map(bm => bm.id), 0) + 1;
    const newMetadata: BackendTypes.BlogMetadata = {
      id: newId,
      title_options: [],
      meta_description: '',
      ...metadata
    };
    console.log('newMetadata:', newMetadata);
    data.blog_metadata.push(newMetadata);
    await this.saveData(data);
    return newId;
  }

  async getBlogMetadataByContentOutputId(contentOutputId: number): Promise<BackendTypes.BlogMetadata | undefined> {
    const data = await this.loadData();
    return data.blog_metadata.find(bm => bm.content_output_id === contentOutputId);
  }

  async getBlogMetadataById(id: number): Promise<BackendTypes.BlogMetadata | undefined> {
    const data = await this.loadData();
    return data.blog_metadata.find(bm => bm.id === id);
  }

  async updateBlogMetadata(id: number, updates: Partial<BackendTypes.BlogMetadata>): Promise<void> {
    const data = await this.loadData();
    const metadata = data.blog_metadata.find(bm => bm.id === id);
    if (metadata) {
      Object.assign(metadata, updates);
      await this.saveData(data);
    } else {
      throw new Error(`Blog metadata with id ${id} not found`);
    }
  }

  async saveStepOutput(stepOutput: Omit<BackendTypes.StepOutput, 'id'>): Promise<number> {
    const data = await this.loadData();
    if (!data.step_outputs) {
      data.step_outputs = [];
    }
    const newId = Math.max(...data.step_outputs.map(so => so.id), 0) + 1;
    const newStepOutput: BackendTypes.StepOutput = {
      id: newId,
      ...stepOutput
    };
    data.step_outputs.push(newStepOutput);
    await this.saveData(data);
    return newId;
  }

  async getStepOutputById(id: number): Promise<BackendTypes.StepOutput | undefined> {
    const data = await this.loadData();
    return data.step_outputs.find(so => so.id === id);
  }

  async updateStepOutput(stepOutputId: number, status: BackendTypes.StepOutput['step_status'], output: any): Promise<void> {
    const data = await this.loadData();
    const stepOutput = data.step_outputs.find(so => so.id === stepOutputId);

    if (stepOutput) {
      stepOutput.step_status = status;
      stepOutput.step_output = output;
      await this.saveData(data);
    } else {
      throw new Error(`Step output with id ${stepOutputId} not found`);
    }
  }

  async getContentOutputById(id: number): Promise<BackendTypes.ContentOutput | undefined> {
    const data = await this.loadData();
    return data.content_outputs.find(co => co.id === id);
  }

  async createValidationItem(userID: number, contentOutputId: number, stepOutputType: string, options: Record<string, string>): Promise<void> {
    const data = await this.loadData();
    // Ensure data.validations is initialized if it doesn't exist
    data.validations = data.validations || [];
    const newValidationItem: BackendTypes.Validations = {
      // Use 0 as the default value if data.validations is empty
      id: Math.max(0, ...data.validations.map(v => v.id)) + 1,
      content_output_id: contentOutputId,
      step_output_type: stepOutputType,
      validation_status: 'pending',
      options,
      feedback: {},
      selected_option: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: userID
    };
    data.validations.push(newValidationItem);
    await this.saveData(data);
  }

  async getPendingValidationOutputs(): Promise<BackendTypes.ContentOutput[]> {
    const data = await this.loadData();
    return data.content_outputs.filter(co => co.status === "pending validation");
  }

  // using new structure
  async getValidationItems(contentOutputId: number): Promise<FrontendTypes.Validations[]> {
    const data = await this.loadData();
    const items = data.validations
      .filter(v => v.content_output_id === contentOutputId)
      // Exclude the fields not part of the Frontent Validations interface
      .map(({ created_at, updated_at, updated_by, ...rest }) => rest);
    return items;
  }

  async getValidationItemByID(validationID: number): Promise<FrontendTypes.Validations> {
    const data = await this.loadData();
    const item = data.validations.find(v => v.id === validationID);
    if (!item) {
      throw new Error(`Validation item with id ${validationID} not found`);
    }
    const { created_at, updated_at, updated_by, ...rest } = item;
    return rest;
  }

  async getPendingValidationItems(contentOutputId: number): Promise<FrontendTypes.Validations[]> {
    const data = await this.loadData();
    const items = data.validations
      .filter(v => v.content_output_id === contentOutputId && v.validation_status === "pending")
      // Exclude the fields not part of the Frontent Validations interface
      .map(({ created_at, updated_at, updated_by, ...rest }) => rest);
    return items;
  }

  async updateValidationItem(validationItem: FrontendTypes.Validations): Promise<FrontendTypes.Validations> {
    const data = await this.loadData();
    const index = data.validations.findIndex(v => v.id === validationItem.id);
    if (index === -1) {
      throw new Error(`Validation item with id ${validationItem.id} not found`);
    }
    // update relevant properties of the validation item
    data.validations[index].selected_option = validationItem.selected_option;
    data.validations[index].feedback = validationItem.feedback;
    data.validations[index].validation_status = validationItem.validation_status;
    data.validations[index].updated_at = new Date().toISOString();
    // TO DO: update the updated_by field with the current user ID
    await this.saveData(data);
    const updatedValidationItem = await this.getValidationItemByID(validationItem.id);
    return updatedValidationItem;
  }

  async checkIfAllValidationsCompleted(contentOutputId: number): Promise<boolean> {
    const data = await this.loadData();
    return data.validations.every(v => v.content_output_id === contentOutputId && v.validation_status === "completed");
  }

  async confirmValidations(contentOutputID: number): Promise<FrontendTypes.ContentOutput> {
    const data = await this.loadData();
    const contentOutput = data.content_outputs.find(co => co.id === contentOutputID);
    if (!contentOutput) {
      throw new Error(`Content output with id ${contentOutputID} not found`);
    }
    if (await this.checkIfAllValidationsCompleted(contentOutputID)) {
      contentOutput.status = 'completed';
      // update content with selected option of the validationItem with step output 'final_content'
      contentOutput.content = data.validations.find(
        v => v.content_output_id === contentOutputID &&
          v.step_output_type === 'final_content'
      )?.selected_option || '';
      // update blog metadata with selected option of all the validation items that start with 'final_BM_'
      data.validations
        .filter(v => v.content_output_id === contentOutputID && v.step_output_type.startsWith('final_BM_'))
        .forEach(v => {
          const metadataField = v.step_output_type.split('_').slice(2).join('_');
          const metadata = data.blog_metadata.find(bm => bm.content_output_id === contentOutputID);
          if (metadata) {
            this.updateBlogMetadata(metadata.id, { [metadataField]: v.selected_option });
          } else {
            throw new Error(`Blog metadata for content output with id ${contentOutputID} not found`);
          }
        });

    } else {
      throw new Error(`Not all validations for content output with id ${contentOutputID} are completed`);
    }
    await this.saveData(data);
    const updatedContentOutput = await this.getContentOutputById(contentOutputID);
    if (!updatedContentOutput) {
      throw new Error(`Content output with id ${contentOutputID} not found`);
    }
    return updatedContentOutput;
  }


  async OLD_getPendingValidationItems(contentOutputId: number): Promise<BackendTypes.StepOutput[]> {
    const data = await this.loadData();
    return data.step_outputs.filter(so => so.content_output_id === contentOutputId && so.step_status === "pending validation");
  }

  async saveTokenUsage(tokenUsage: {
    user_id: number;
    content_output_id: number;
    step_output_id: number;
    model: string;
    input_tokens: number;
    output_tokens: number;
  }): Promise<void> {
    const data = await this.loadData();

    if (!data.token_usage) {
      data.token_usage = [];
    }

    const newTokenUsage = {
      id: data.token_usage.length + 1,
      ...tokenUsage,
    };

    data.token_usage.push(newTokenUsage);

    await this.saveData(data);
  }

  private async saveData(data: BackendTypes.AppData): Promise<void> {
    await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

export const dataAccess = new DataAccess('data.json');
