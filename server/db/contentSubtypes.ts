// server/db/contentSubtypes.ts
import { ContentSubType as ContentSubTypeFrontend } from '../../types/frontendTypes'

import dbclient from '../database';

export const contentSubtypes = {

  async getContentSubtypesByOrgId(orgId: string): Promise<ContentSubTypeFrontend[]> {
    const query = `
      SELECT * FROM content_subtypes
      WHERE org_id = $1 OR org_id IS NULL
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
  }
};