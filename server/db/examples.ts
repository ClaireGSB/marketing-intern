// server/db/examples.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { Example as ExampleFrontend } from '../../types/frontendTypes';
import { Example } from '../../types/backendTypes';

export const examples = {
  async create(example: Example): Promise<ExampleFrontend> {
    // const id = uuidv4();
    // const created_at = new Date().toISOString();
    const query = `
      INSERT INTO examples (id, org_id, created_by, updated_by, content_subtype_id, content_output_id, example_type, name, content, created_at, updated_at, explanation)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, content_subtype_id, example_type, name, content, explanation
    `;
    const values = [
      example.id,
      example.org_id,
      example.created_by,
      example.updated_by,
      example.content_subtype_id,
      example.content_output_id,
      example.example_type,
      example.name,
      example.content,
      example.created_at,
      example.updated_at,
      example.explanation
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, updates: Partial<Example>): Promise<ExampleFrontend | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE examples
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, content_subtype_id, example_type, name, content, explanation
    `;
    const values = [id, ...Object.values(updates)];
    const result = await dbclient.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE examples
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id]);
    // return true if the row was updated, false if no row was updated (because it didn't exist)
    return result.rowCount ? result.rowCount > 0 : false;
  },

  async getByContentSubtypeId(contentSubtypeId: string): Promise<Example[]> {
    const query = `
      SELECT *
      FROM examples
      WHERE content_subtype_id = $1 AND deleted_at IS NULL
    `;
    const result = await dbclient.query(query, [contentSubtypeId]);
    return result.rows;
  },

  async getByOrg(orgId: string): Promise<ExampleFrontend[]> {
    const query = `
      SELECT id, content_subtype_id, example_type, name, content, explanation
      FROM examples
      WHERE org_id = $1 AND deleted_at IS NULL
    `;
    const result = await dbclient.query(query, [orgId]);
    return result.rows;
  }

};
