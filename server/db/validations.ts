// server/db/validations.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { Validations } from '../../types/backendTypes';
import { Validations as ValidationsFrontend } from '../../types/frontendTypes';
import { blogMetadatas } from './blogMetadatas';
import { ContentOutput as ContentOutputFrontend } from '../../types/frontendTypes';

export const validations = {
  async create(validation: Omit<Validations, 'id' | 'created_at' | 'updated_at'>): Promise<Validations> {
    const id = uuidv4();
    const query = `
      INSERT INTO validations (id, org_id, content_output_id, step_output_type, validation_status, options, feedback, selected_option, created_at, updated_at, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $9)
      RETURNING *
    `;
    const values = [
      id,
      validation.org_id,
      validation.content_output_id,
      validation.step_output_type,
      validation.validation_status,
      JSON.stringify(validation.options),
      JSON.stringify(validation.feedback),
      validation.selected_option,
      validation.updated_by
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, updates: Partial<Validations>): Promise<ValidationsFrontend> {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        if (key === 'options' || key === 'feedback') {
          return `${key} = $${index + 2}::jsonb`;
        }
        return `${key} = $${index + 2}`;
      })
      .join(', ');
    const query = `
      UPDATE validations
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [
      id,
      ...Object.entries(updates).map(([key, value]) =>
        key === 'options' || key === 'feedback' ? JSON.stringify(value) : value
      )
    ];
    const result = await dbclient.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Validation not found');
    }
    // map the result to the frontend type
    return {
      id: result.rows[0].id,
      content_output_id: result.rows[0].content_output_id,
      step_output_type: result.rows[0].step_output_type,
      validation_status: result.rows[0].validation_status,
      options: result.rows[0].options,
      feedback: result.rows[0].feedback,
      selected_option: result.rows[0].selected_option,
    };
  },

  async getValidationsByOrgID(orgId: string): Promise<Validations[]> {
    const query = `
      SELECT *
      FROM validations
      WHERE org_id = $1
    `;
    const result = await dbclient.query(query, [orgId]);
    return result.rows;
  },

  async getValidationsByContentOutputID(contentOutputId: string): Promise<Validations[]> {
    const query = `
      SELECT *
      FROM validations
      WHERE content_output_id = $1
    `;
    const result = await dbclient.query(query, [contentOutputId]);
    return result.rows;
  },

  async getValidationByID(id: string): Promise<Validations | null> {
    const query = `
      SELECT *
      FROM validations
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id]);
    return result.rows[0] || null;
  },

  async getNonCompletedValidationsByContentOutputID(contentOutputId: string): Promise<Validations[]> {
    const query = `
      SELECT *
      FROM validations
      WHERE content_output_id = $1 AND validation_status != 'completed'
    `;
    const result = await dbclient.query(query, [contentOutputId]);
    return result.rows;
  },

  async confirmValidations(contentOutputId: string): Promise<ContentOutputFrontend> {
    console.log('confirmValidations process started');
    // 1. get all the validations for the content output
    const validations = await this.getValidationsByContentOutputID(contentOutputId);
    // 2. check if all validations are completed
    const allValidationsCompleted = validations.every(validation => validation.validation_status === 'completed');
    if (!allValidationsCompleted) {
      throw new Error('Not all validations are completed');
    }
    // 3. check that they all have a selected option 
    const allValidationsHaveSelectedOption = validations.every(validation => validation.selected_option !== null);
    if (!allValidationsHaveSelectedOption) {
      throw new Error('Not all validations have a selected option');
    }
    // 4. check that for all of them, option['selected_option'] is not null or empty
    const allValidationsHaveSelectedOptionValue = validations.every(validation => validation.options[validation.selected_option] !== null && validation.options[validation.selected_option] !== '');
    if (!allValidationsHaveSelectedOptionValue) {
      throw new Error('Not all validations have a selected option value');
    }

    // 5. find the validation where step output type is 'final_content' and assign the content to the content output
    const finalContentValidation = validations.find(validation => validation.step_output_type === 'final_content');
    if (!finalContentValidation) {
      throw new Error('Final content validation not found');
    }
    const finalContent = finalContentValidation.options[finalContentValidation.selected_option];

    // 6. update the content output with the final content and set the status to 'completed'
    const query = `
      UPDATE content_outputs
      SET content = $2, status = 'completed'
      WHERE id = $1
      RETURNING *
    `;
    const values = [contentOutputId, finalContent];
    const result = await dbclient.query(query, values);
    if (result.rowCount === 0 || result.rowCount === null) {
      throw new Error('Content output not found');
    }
    const updatedContentOutput = result.rows[0]; 
    console.log('Content output updated:', updatedContentOutput);

    // 7. if there are validations where step output type starts with "final_BM_", for each of them, Extract the metadata field name - it's everything after the second underscore
    // and update or create blog metadata
    const finalBMValidations = validations.filter(validation => validation.step_output_type.startsWith('final_BM_'));
    for (const validation of finalBMValidations) {
      // extract the metadata field name
      const metadataFieldName = validation.step_output_type.split('_').slice(2).join('_');
      const metadataValue = validation.options[validation.selected_option];
      // use blogMetadatas.updateOrCreate to update or create the blog metadata
      const updateData = {
        [metadataFieldName]: metadataValue
      };

      await blogMetadatas.updateOrCreate(contentOutputId, updateData);
      // TO DO - handle the case where the metadata field name is not found or other errors
      // also handle the fact the we're not telling the frontend that the metadata was updated
    }

    // 8. return Content output formatted for frontend if all validations are completed and the content output is updated

    const formattedContentOutput: ContentOutputFrontend = {
      id: updatedContentOutput.id,
      content_subtype_id: updatedContentOutput.content_subtype_id,
      content: updatedContentOutput.content,
      status: updatedContentOutput.status,
      created_at: updatedContentOutput.created_at,
      created_by: updatedContentOutput.created_by,
      content_type_id: updatedContentOutput.content_type_id,
    };

    return formattedContentOutput;
  }
};