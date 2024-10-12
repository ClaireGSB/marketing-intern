import { defineEventHandler } from 'h3'
import { Validations as ValidationFrontend } from '../../../../types/frontendTypes';
import { validations } from '~/server/db/validations';

export default defineEventHandler(async (event) => {

  try {

    console.log('API received a request to confirm validations')
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

    const updatedContentOutput = await validations.confirmValidations(contentOutputID)
    
    if(!updatedContentOutput) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Error confirming validations',
      })
    }

    return {
      statusCode: 200,
      body: updatedContentOutput,
    }

  } catch (error) {
    console.error('Error confirming validations:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error confirming validations',
    })
  }
})