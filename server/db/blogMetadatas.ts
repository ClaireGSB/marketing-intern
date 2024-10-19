// server/db/blogMetadatas.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { BlogMetadata } from '../../types/backendTypes';

export const blogMetadatas = {
  async create(content_output_id: string, blogMetadata: Partial<BlogMetadata>, orgId: string): Promise<BlogMetadata> {
    const id = uuidv4();
    const query = `
      INSERT INTO blog_metadata (id, content_output_id, title, meta_description, formatted_post, org_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      id,
      content_output_id,
      // blogMetadata.title_options ? JSON.stringify(blogMetadata.title_options) : null,
      blogMetadata.title? blogMetadata.title : '',
      blogMetadata.meta_description ? blogMetadata.meta_description : '',
      blogMetadata.formatted_post? blogMetadata.formatted_post : '',
      orgId
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, updates: Partial<BlogMetadata>): Promise<BlogMetadata> {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        return `${key} = $${index + 2}`;
      })
      .join(', ');
    const query = `
      UPDATE blog_metadata
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    const values = [
      id,
      ...Object.values(updates)
    ];
    const result = await dbclient.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Blog metadata not found');
    }
    return result.rows[0];
  },

  async getBlogMetadataByOrgId(Org: string): Promise<BlogMetadata[]> {
    const query = `
      SELECT *
      FROM blog_metadata
      WHERE org_id = $1
    `;
    const result = await dbclient.query(query, [Org]);
    return result.rows;
  },

  async getBlogMetadataByID(id: string): Promise<BlogMetadata | null> {
    const query = `
      SELECT *
      FROM blog_metadata
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [id]);
    return result.rows[0] || null;
  },

  async getBlogMetadataByContentOutputId(contentOutputId: string): Promise<BlogMetadata | null> {
    const query = `
      SELECT *
      FROM blog_metadata
      WHERE content_output_id = $1
    `;
    const result = await dbclient.query(query, [contentOutputId]);
    return result.rows[0] || null;
  },

  async updateOrCreate(content_output_id: string, updates: Partial<BlogMetadata>, orgId: string): Promise<BlogMetadata> {
    const existingMetadata = await this.getBlogMetadataByContentOutputId(content_output_id);
    if (existingMetadata) {
      return this.update(existingMetadata.id, updates);
    }
    return this.create(content_output_id, updates, orgId);
  }
};