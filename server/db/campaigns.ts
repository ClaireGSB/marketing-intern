// server/db/campaigns.ts

import dbclient from '../database';
import { ContentOutput } from '../../types/backendTypes'
import { ContentOutput as ContentOutputFrontend } from '../../types/frontendTypes'
import { Campaign } from '../../types/backendTypes';
import { Campaign as CampaignFrontend } from '../../types/frontendTypes';
import { stringify } from 'openai/internal/qs/stringify.mjs';

export const campaigns = {

  stringify: (action_inputs: any): string => {
    if (typeof action_inputs === 'object' && action_inputs !== null) {
      return JSON.stringify(action_inputs);
    } else if (typeof action_inputs === 'string') {
      return action_inputs;
    } else if (action_inputs === null) {
      return '{}';
    }
    return String(action_inputs);
  },

  async create(campaign: Campaign): Promise<Campaign> {
    // if action inputs are an object, convert to JSON string
    const actionInputs = this.stringify(campaign.action_inputs);
    // insert the campaign into the database
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
      actionInputs,
      campaign.created_at,
      campaign.created_by,
      campaign.updated_at,
      campaign.updated_by
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    // Check if action_inputs is part of updates and stringify it if necessary
    const processedUpdates: { [key: string]: any } = { ...updates };
    if (processedUpdates.action_inputs !== undefined) {
      processedUpdates.action_inputs = this.stringify(updates.action_inputs);
    }

    const setClause = Object.keys(processedUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE campaigns
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(processedUpdates)];
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
