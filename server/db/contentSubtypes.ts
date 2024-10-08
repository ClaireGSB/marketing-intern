// server/db/contentSubtypes.ts
import { ContentSubType } from '../../types/backendTypes'

import dbclient from '../database';

// export interface ContentSubtype {
//   id: string;
//   org_id: string | null;
//   content_type_id: number;
//   name: string;
//   context: string;
//   guidelines: string;
//   target_audience: string;
//   created_at: string;
//   updated_at: string;
//   created_by: string;
//   updated_by: string;
// }

export const contentSubtypes = {

  async getContentSubtypesByOrgId(orgId: string): Promise<ContentSubType[]> {
    const query = `
      SELECT * FROM content_subtypes
      WHERE org_id = $1 OR org_id IS NULL
      ORDER BY content_type_id, name
    `;
    const result = await dbclient.query(query, [orgId]);
    return result.rows;
  }
};