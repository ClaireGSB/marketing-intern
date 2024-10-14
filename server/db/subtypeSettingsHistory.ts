// server/database/subtypeSettingsHistory.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { hashObject, stableStringify  } from './utils/hashJson';
import { SettingsInput } from '../../types/backendTypes';

export const subtypeSettingsHistory = {
  async saveSubtypeSettingsHistory(settingsInput: SettingsInput): Promise<string> {
    const hash = hashObject(settingsInput);

    // Check if settings already exist
    const existingSettings = await dbclient.query(
      'SELECT id FROM subtype_settings_history WHERE hash = $1',
      [hash]
    );

    if (existingSettings.rows.length > 0) {
      return existingSettings.rows[0].id;
    }

    // If not, insert new settings
    const id = uuidv4();
    const stableJson = stableStringify(settingsInput);
    await dbclient.query(
      'INSERT INTO subtype_settings_history (id, content, hash) VALUES ($1, $2, $3)',
      [id, stableJson, hash]
    );

    return id;
  },

  async getSubtypeSettingsHistory(id: string): Promise<SettingsInput> {
    const result = await dbclient.query(
      'SELECT content FROM subtype_settings_history WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Subtype Settings not found');
    }

    return result.rows[0].content;
  },

  async getSSHByContentOutputID(contentOutputID: string): Promise<SettingsInput> {
    const query = `
      SELECT ss.content, ss.id
      FROM content_outputs co
      JOIN subtype_settings_history ss ON co.subtype_settings_history_id = ss.id
      WHERE co.id = $1
    `;

    const result = await dbclient.query(query, [contentOutputID]);

    if (result.rows.length === 0) {
      throw new Error('Subtype Settings not found for content output: ' + contentOutputID);
    }

    const content = result.rows[0].content;
    content.id = result.rows[0].id;
    console.log('Subtype Settings found : ');
    // iterate over the content object and log the keys and values
    for (const [key, value] of Object.entries(content)) {
      console.log(key + ' : ' + value);
    }

    return content;
  }
};