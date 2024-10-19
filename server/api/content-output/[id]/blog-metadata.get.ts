// server/api/content-output/[id]]/blog-metadata.get.ts

import { defineEventHandler } from 'h3'
import { BlogMetadata as BlogMetadataFrontend } from '~/types/frontendTypes';
import { blogMetadatas } from '~/server/db/blogMetadatas';

export default defineEventHandler(async (event) => {

  try {

    // TO DO: replace this with auth check 
    const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required',
      })
    }

    const contentOutputID = event.context.params?.id;
    
    if (!contentOutputID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing content output ID',
      })
    }

    const metaData = await blogMetadatas.getBlogMetadataByContentOutputId(contentOutputID)

    // Ensure the data matches the ExampleFrontend interface
    if (!metaData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Error fetching metadata',
      })
    }

    const formattedMetadata: BlogMetadataFrontend = {
      id: metaData.id,
      content_output_id: metaData.content_output_id,
      title_options: metaData.title_options? metaData.title_options : [],
      title: metaData.title? metaData.title : '',
      meta_description: metaData.meta_description? metaData.meta_description : '',
      formatted_post: metaData.formatted_post? metaData.formatted_post : '',
    }

    return {
      statusCode: 200,
      body: formattedMetadata,
    }
  } catch (error) {
    console.error('Error fetching examples:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching examples',
    })
  }
})
