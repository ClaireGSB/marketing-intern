// server/db/campaigns.ts

import dbclient from '../database';
import { ContentOutput } from '../../types/backendTypes'
import { ContentOutput as ContentOutputFrontend } from '../../types/frontendTypes'
import { Campaign } from '../../types/backendTypes';
import { Campaign as CampaignFrontend } from '../../types/frontendTypes';

export const campaigns = {
  async create(campaign: Campaign): Promise<Campaign> {
    const query = `
      INSERT INTO campaigns (id, org_id, name, action, guidelines, context, action_inputs, created_at, created_by, updated_at, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      campaign.id,
      campaign.org_id,
      campaign.name,
      campaign.action,
      campaign.guidelines,
      campaign.context,
      campaign.action_inputs,
      campaign.created_at,
      campaign.created_by,
      campaign.updated_at,
      campaign.updated_by
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE campaigns
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];
    const result = await dbclient.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE campaigns
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id]);
    // return true if the row was updated, false if no row was updated (because it didn't exist)
    return result.rowCount ? result.rowCount > 0 : false;
  },

  async getByOrg(orgId: string): Promise<Campaign[]> {
    const query = `
      SELECT *
      FROM campaigns
      WHERE org_id = $1 AND deleted_at IS NULL
    `;
    const result = await dbclient.query(query, [orgId]);
    return result.rows;
  },
};
