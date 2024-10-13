// server/database/projectSetups.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { hashObject, stableStringify  } from './utils/hashJson';
import { UserInput } from '../../types/backendTypes';

export const projectSetups = {
  async saveProjectSetup(userInput: UserInput): Promise<string> {
    const hash = hashObject(userInput);

    // Check if settings already exist
    const existingSettings = await dbclient.query(
      'SELECT id FROM project_setups WHERE hash = $1',
      [hash]
    );

    if (existingSettings.rows.length > 0) {
      return existingSettings.rows[0].id;
    }

    // If not, insert new settings
    const id = uuidv4();
    const stableJson = stableStringify(userInput);
    await dbclient.query(
      'INSERT INTO project_setups (id, content, hash) VALUES ($1, $2, $3)',
      [id, stableJson, hash]
    );

    return id;
  },

  async getProjectSetup(id: string): Promise<UserInput> {
    const result = await dbclient.query(
      'SELECT content FROM project_setups WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Project setup not found');
    }

    return result.rows[0].content;
  },

  async getProjectSetupByContentOutputID(contentOutputID: string): Promise<UserInput> {
    const query = `
      SELECT ps.content
      FROM content_outputs co
      JOIN project_setups ps ON co.project_setup_id = ps.id
      WHERE co.id = $1
    `;

    const result = await dbclient.query(query, [contentOutputID]);

    if (result.rows.length === 0) {
      throw new Error('Project setup not found for content output: ' + contentOutputID);
    }

    return result.rows[0].content;
  }
};