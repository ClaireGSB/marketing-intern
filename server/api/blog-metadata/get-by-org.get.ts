// server/api/blog-metadata/get-by-org.get.ts

import { defineEventHandler } from 'h3'
import { BlogMetadata as BlogMetadataFrontend } from '../../../types/frontendTypes';
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

    const metaDataList = await blogMetadatas.getBlogMetadataByOrgId(orgId)

    // Ensure the data matches the ExampleFrontend interface
    const formattedValidations: BlogMetadataFrontend[] = metaDataList.map(metadata => ({
      id: metadata.id,
      content_output_id: metadata.content_output_id,
      title_options: metadata.title_options? metadata.title_options : [],
      title: metadata.title? metadata.title : '',
      meta_description: metadata.meta_description? metadata.meta_description : '',
      formatted_post: metadata.formatted_post? metadata.formatted_post : '',
    }))

    return {
      statusCode: 200,
      body: formattedValidations,
    }
  } catch (error) {
    console.error('Error fetching examples:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching examples',
    })
  }
})

