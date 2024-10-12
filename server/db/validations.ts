// server/db/validations.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { Validations } from '../../types/backendTypes';

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

  async update(id: string, updates: Partial<Validations>): Promise<Validations | null> {
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
    return result.rows[0] || null;
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
  }
};