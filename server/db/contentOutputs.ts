// server/db/contentOutputRepository.ts

import dbclient from '../database';

export interface ContentOutput {
  id: string;
  org_id: string;
  created_by: string;
  content_type_id: number;
  content_subtype_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const contentOutputs = {
  async create(contentOutput: Omit<ContentOutput, 'id' | 'created_at' | 'updated_at'>): Promise<ContentOutput> {
    const query = `
      INSERT INTO content_outputs (org_id, created_by, content_type_id, content_subtype_id, content, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      contentOutput.org_id,
      contentOutput.created_by,
      contentOutput.content_type_id,
      contentOutput.content_subtype_id,
      contentOutput.content,
      contentOutput.status
    ];
    const result = await dbclient.query(query, values);
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
  }
};