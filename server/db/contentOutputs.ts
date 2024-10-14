// server/db/contentOutputs.ts

import { ContentOutput } from '../../types/backendTypes'
import { ContentOutput as ContentOutputFrontend } from '../../types/frontendTypes'
import { UserInput } from '../../types/frontendTypes'
import { UserInput as UserInputBackend } from '../../types/backendTypes';
import { myQueue } from '../../queues/queue';
import { contentSubtypes } from './contentSubtypes';
import { examples } from './examples';
import { Example} from '../../types/backendTypes';
import { SettingsInputWithoutExamples, SettingsInput } from '../../types/backendTypes'
import { getContentTypeNameByID } from '../../types/contentTypes';
import { projectSetups } from './projectSetups';
import { subtypeSettingsHistory } from './subtypeSettingsHistory';
import { blogMetadatas } from './blogMetadatas';

import dbclient from '../database';

export const contentOutputs = {

  async create(contentOutput: ContentOutput, userInput: UserInput): Promise<ContentOutput> {
    console.log('db file received a new initialization request')

    // 1. COMPILE SUBTYPE SETTINGS
    const subtypeId = contentOutput.content_subtype_id;
    if (!subtypeId) {
      throw new Error('Content subtype ID is required');
    }

    const subtypeSettingsExceptExamples: SettingsInputWithoutExamples = await contentSubtypes.getContentSubtypeSettingsById(subtypeId);
    const subtypeExamples: Example[] = await examples.getByContentSubtypeId(subtypeId);
    const subtypeSettings: SettingsInput = {
      ...subtypeSettingsExceptExamples,
      examples: subtypeExamples,
    };

    // 2. SAVE PROJECT SETUP AND SUBTYPE SETTINGS HISTORY
    const project_setup_id = await projectSetups.saveProjectSetup(userInput);
    const subtype_settings_history_id = await subtypeSettingsHistory.saveSubtypeSettingsHistory(subtypeSettings);

    // 3. INSERT NEW CONTENT OUTPUT INTO DB
    const query = `
    INSERT INTO content_outputs (id, org_id, created_by, content_type_id, content_subtype_id, content, status, created_at, updated_at, project_setup_id, subtype_settings_history_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      contentOutput.updated_at,
      project_setup_id,
      subtype_settings_history_id
    ];
    const result = await dbclient.query(query, values);
    console.log('New content output initialized in db')

    // 4. GET RECIPE NAME
    const recipe_name = getContentTypeNameByID(contentOutput.content_type_id);
    if (!recipe_name) {
      throw new Error('Could not find recipe name for content type ID');
    }

    // 4.5 if selected_content_output_id is provided, get this content output from database
    const projectSettings: UserInputBackend = {...userInput}

    if (userInput.selected_content_output_id) {
      console.log(' ###### Selected content output ID provided:', userInput.selected_content_output_id);
      const selectedContentOutput = await contentOutputs.getContentOutputById(userInput.selected_content_output_id);
      projectSettings.content = selectedContentOutput.content;
      projectSettings.selected_content_type = getContentTypeNameByID(selectedContentOutput.content_type_id);
      // if content_type is blog_post, get blog metadata
      if ( projectSettings.selected_content_type === 'blog_post') {
        const blog_metadata = await blogMetadatas.getBlogMetadataByContentOutputId(selectedContentOutput.id);
        projectSettings.selected_content_blog_metadata = blog_metadata? blog_metadata : undefined;
      }
    }

    // 5. ADD JOB TO QUEUE
    const jobData = {
      recipe_name: recipe_name,
      content_output_id: contentOutput.id,
      org_id: contentOutput.org_id,
      user_id: contentOutput.created_by,
      subtype_id: subtypeId,
      user_settings: projectSettings,
      subtype_settings: subtypeSettings
    };

    console.log('Job data:', jobData);


    // add job to queue
    try {
      const job = await myQueue.add('InitializeRecipe', { 
        ...jobData,
      });
      console.log('Job added to queue:', job.id);
    } catch (error) {
      console.error('Error adding job to queue:', error);
    }


    // 6. RETURN INITIALIZED NEW CONTENT OUTPUT
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
      project_setup_id: row.project_setup_id,
    }));
  },

  async getContentOutputById(id: string): Promise<ContentOutput> {
    const query = `
      SELECT * FROM content_outputs
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id]);
    if (result.rows.length === 0) {
      throw new Error('Content output not found');
    }
    return result.rows[0];
  },

};
