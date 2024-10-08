// server/db/contentOutputs.ts

import { ContentOutput } from '../../types/backendTypes'

import dbclient from '../database';

export const contentOutputs = {
  
  async create(contentOutput: ContentOutput): Promise<ContentOutput> {
    console.log('db file received a new initialization request:', contentOutput)
    const query = `
      INSERT INTO content_outputs (id, org_id, created_by, content_type_id, content_subtype_id, content, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      contentOutput.id,
      contentOutput.org_id,
      contentOutput.created_by,
      contentOutput.content_type_id,
      contentOutput.content_subtype_id,
      contentOutput.content,
      contentOutput.status,
      contentOutput.created_at,
      contentOutput.updated_at
    ];
    const result = await dbclient.query(query, values);
    console.log('New content output initialized in db:', result.rows[0])
    return result.rows[0];
  },

  async update(id: string, updates: Partial<ContentOutput>): Promise<ContentOutput | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE content_outputs
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];
    const result = await dbclient.query(query, values);
    return result.rows[0] || null;
  },

  async getContentOutputsByOrgId(orgId: string): Promise<ContentOutput[]> {
    const query = `
      SELECT * FROM content_outputs
      WHERE org_id = $1
      ORDER BY created_at DESC
    `;
    const result = await dbclient.query(query, [orgId]);
    return result.rows;
  },

};
