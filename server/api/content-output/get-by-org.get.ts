import { defineEventHandler } from 'h3'
import { contentOutputs } from '../../db/contentOutputs'
import { ContentOutput as ContentOutputFrontend } from '../../../types/frontendTypes'

export default defineEventHandler(async (event) => {

  // TO DO: replace this with auth check 
  const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID is required',
    })
  }

  try {
    const contentOutputsByOrg = await contentOutputs.getContentOutputsByOrgId(orgId)

    // Ensure the data matches the ContentOutputFrontend interface
    const formattedOutputs: ContentOutputFrontend[] = contentOutputsByOrg.map(output => ({
      id: output.id,
      created_by: output.created_by,
      content_type_id: output.content_type_id,
      content_subtype_id: output.content_subtype_id,
      content: output.content,
      created_at: output.created_at,
      status: output.status as ContentOutputFrontend['status'], // Ensure this is one of the valid status values
      project_setup_id: output.project_setup_id,
    }))

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
