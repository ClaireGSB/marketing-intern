import { defineEventHandler } from 'h3'
import { projectSetups } from '~/server/db/projectSetups'
import { UserInput as UserInputFrontend } from '~/types/frontendTypes'

export default defineEventHandler(async (event) => {

  try {

    console.log('API received a request get project setup')
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

    const setup = await projectSetups.getProjectSetupByContentOutputID(contentOutputID)
    
    if(!setup) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Error confirming validations',
      })
    }

    // Ensure the data matches the UserInputFrontend interface
    const formattedSetups: UserInputFrontend = {
      id: setup.id,
      content_subtype_id: setup.content_subtype_id,
      content_type_id: setup.content_type_id,
      action: setup.action || '',
      topic: setup.topic || '',
      target_audience: setup.target_audience || '',
      guidelines: setup.guidelines || '',
      context: setup.context || '',
      content: setup.content || '',
      ideas: setup.ideas || '',
      repurpose_instructions: setup.repurpose_instructions || '',
      selected_content_output_id: setup.selected_content_output_id || '',
    }


    return {
      statusCode: 200,
      body: formattedSetups,
    }

  } catch (error) {
    console.error('Error getting project setup', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'getting project setup',
    })
  }
})