import { defineEventHandler } from 'h3'
import { contentOutputs } from '../../db/contentOutputs'
import { ContentOutput as ContentOutputFrontend } from '../../../types/frontendTypes'

export default defineEventHandler(async (event) => {
  console.log('######### fetching content output by id')

  // TO DO: replace this with auth check 
  const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID is required',
    })
  }

  try {

    const id = event.context.params?.id;
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing content output ID',
      })
    }
    const contentOutput = await contentOutputs.getContentOutputById(id)

    // Ensure the data matches the ContentOutputFrontend interface
    const formattedOutputs: ContentOutputFrontend = {
      id: contentOutput.id,
      created_by: contentOutput.created_by,
      content_type_id: contentOutput.content_type_id,
      content_subtype_id: contentOutput.content_subtype_id,
      content: contentOutput.content,
      created_at: contentOutput.created_at,
      status: contentOutput.status as ContentOutputFrontend['status'], // Ensure this is one of the valid status values
    }

    return {
      statusCode: 200,
      body: formattedOutputs,
    }
  } catch (error) {
    console.error('Error fetching content outputs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching content outputs',
    })
  }
})
