// server/db/blogMetadatas.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { BlogMetadata } from '../../types/backendTypes';

export const blogMetadatas = {
  async create(blogMetadata: Omit<BlogMetadata, 'id'>): Promise<BlogMetadata> {
    const id = uuidv4();
    const query = `
      INSERT INTO blog_metadata (id, content_output_id, title_options, title, meta_description, formatted_post)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      id,
      blogMetadata.content_output_id,
      blogMetadata.title_options ? JSON.stringify(blogMetadata.title_options) : null,
      blogMetadata.title,
      blogMetadata.meta_description,
      blogMetadata.formatted_post
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, updates: Partial<BlogMetadata>): Promise<BlogMetadata | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        if (key === 'title_options') {
          return `${key} = $${index + 2}::jsonb`;
        }
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
      ...Object.entries(updates).map(([key, value]) => 
        key === 'title_options' ? JSON.stringify(value) : value
      )
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0] || null;
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
  }
};