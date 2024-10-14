// server/db/contentSubtypes.ts
import { ContentSubType as ContentSubTypeFrontend } from '../../types/frontendTypes'
import { SettingsInputWithoutExamples } from '../../types/backendTypes'
import { ContentSubType } from '../../types/backendTypes';

import dbclient from '../database';

export const contentSubtypes = {

  async create(contentSubtype:ContentSubType): Promise<ContentSubTypeFrontend> {
    const query = `
      INSERT INTO content_subtypes (id, org_id, content_type_id, name, context, guidelines, target_audience, created_at, updated_at, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, org_id, content_type_id, name, context, guidelines, target_audience
    `;
    const values = [
      contentSubtype.id,
      contentSubtype.org_id,
      contentSubtype.content_type_id,
      contentSubtype.name,
      contentSubtype.context,
      contentSubtype.guidelines,
      contentSubtype.target_audience,
      contentSubtype.created_at,
      contentSubtype.updated_at,
      contentSubtype.created_by,
      contentSubtype.updated_by
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, updates: Partial<ContentSubTypeFrontend>): Promise<ContentSubTypeFrontend | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE content_subtypes
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, org_id, content_type_id, name, context, guidelines, target_audience
    `;
    const values = [id, ...Object.values(updates)];
    const result = await dbclient.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const deleted_at = new Date().toISOString();
    const query = `
      UPDATE content_subtypes
      SET deleted_at = $2
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id, deleted_at]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  async getContentSubtypesByOrgId(orgId: string): Promise<ContentSubTypeFrontend[]> {
    const query = `
      SELECT * FROM content_subtypes
      WHERE org_id = $1 AND deleted_at IS NULL
      ORDER BY content_type_id, name
    `;
    const result = await dbclient.query(query, [orgId]);
    return result.rows.map(row => ({
      id: row.id,
      org_id: row.org_id,
      content_type_id: row.content_type_id,
      name: row.name,
      context: row.context,
      guidelines: row.guidelines,
      target_audience: row.target_audience,
    }));
  },

  async getContentSubtypeSettingsById(id: string): Promise<SettingsInputWithoutExamples> {
    const query = `
      SELECT target_audience, context, guidelines, name FROM content_subtypes
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id]);
    if (!result.rows.length) {
      throw new Error(`Content subtype not found: ${id}`);
    }
    return result.rows[0];
  }
};