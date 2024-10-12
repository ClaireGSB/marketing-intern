// server/db/contentOutputs.ts

import { ContentOutput } from '../../types/backendTypes'
import { ContentOutput as ContentOutputFrontend } from '../../types/frontendTypes'
import { UserInput } from '../../types/frontendTypes'
import { myQueue } from '../../queues/queue';
import { contentSubtypes } from './contentSubtypes';
import { examples } from './examples';
import { Example} from '../../types/backendTypes';
import { SettingsInputWithoutExamples, SettingsInput } from '../../types/backendTypes'
import { getContentTypeNameByID } from '../../types/contentTypes';

import dbclient from '../database';

export const contentOutputs = {

  async create(contentOutput: ContentOutput, userInput: UserInput): Promise<ContentOutput> {
    console.log('db file received a new initialization request')

    // insert new content output into db
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
    console.log('New content output initialized in db')

    // compile data for job
    // the payload for the request has this shape:
    // {
    // subtype_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    // content_type_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    // user_settings: {
    //   action: 'generate',
    //   target_audience: 'This is the content',
    //   context: 'This is the context',
    //   guidelines: 'These are the guidelines',
    // },
    // }
    // we need to add to this object the subtype settings
    // get the subtype settings from the db

    const subtypeId = contentOutput.content_subtype_id;
    if (!subtypeId) {
      throw new Error('Content subtype ID is required');
    }

    const recipe_name = getContentTypeNameByID(contentOutput.content_type_id);
    if (!recipe_name) {
      throw new Error('Could not find recipe name for content type ID');
    }

    const subtypeSettingsExceptExamples: SettingsInputWithoutExamples = await contentSubtypes.getContentSubtypeSettingsById(subtypeId);
    const subtypeExamples: Example[] = await examples.getByContentSubtypeId(subtypeId);
    const subtypeSettings: SettingsInput = {
      ...subtypeSettingsExceptExamples,
      examples: subtypeExamples,
    };

    const jobData = {
      recipe_name: recipe_name,
      contentOutputId: contentOutput.id,
      org_id: contentOutput.org_id,
      user_id: contentOutput.created_by,
      subtype_id: subtypeId,
      user_settings: userInput,
      subtype_settings: subtypeSettings
    };

    // TO DO: save user settings to db - need new table

    console.log('Job data:', jobData);


    // add job to queue
    try {
      const job = await myQueue.add('InitializeRecipe', { 
        ...jobData,
      });
      console.log('Job added to queue:', job.id);
      // This might log something like: "Job added to queue: 1"
    } catch (error) {
      console.error('Error adding job to queue:', error);
    }



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

  async getContentOutputsByOrgId(orgId: string): Promise<ContentOutputFrontend[]> {
    const query = `
      SELECT * FROM content_outputs
      WHERE org_id = $1
      ORDER BY created_at DESC
    `;
    const result = await dbclient.query(query, [orgId]);
    return result.rows.map(row => ({
      id: row.id,
      created_by: row.created_by,
      content_type_id: row.content_type_id,
      content_subtype_id: row.content_subtype_id,
      content: row.content,
      created_at: row.created_at.toISOString(),
      status: row.status as ContentOutputFrontend['status'],
    }));
  },

  async getContentOutputById(id: string): Promise<ContentOutput | null> {
    const query = `
      SELECT * FROM content_outputs
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id]);
    return result.rows[0] || null;
  },

};
