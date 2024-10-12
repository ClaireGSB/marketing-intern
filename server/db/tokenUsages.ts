// server/db/tokenUsages.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { TokenUsage } from '../../types/backendTypes';

export const tokenUsage = {
  async create(tokenUsage: Omit<TokenUsage, 'id'>): Promise<TokenUsage> {
    const id = uuidv4();
    const query = `
      INSERT INTO token_usage (id, org_id, content_output_id, step_output_id, model, input_tokens, output_tokens)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      id,
      tokenUsage.org_id,
      tokenUsage.content_output_id,
      tokenUsage.step_output_id,
      tokenUsage.model,
      tokenUsage.input_tokens,
      tokenUsage.output_tokens
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  }
};