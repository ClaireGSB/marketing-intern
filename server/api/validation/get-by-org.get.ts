// server/api/validation/get-by-org.get.ts

import { defineEventHandler } from 'h3'
import { Validations as ValidationFrontend } from '../../../types/frontendTypes';
import { validations } from '~/server/db/validations';

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

    const validationList = await validations.getValidationsByOrgID(orgId)

    // Ensure the data matches the ExampleFrontend interface
    const formattedValidations: ValidationFrontend[] = validationList.map(validation => ({
      id: validation.id,
      content_output_id: validation.content_output_id,
      options: validation.options,
      feedback: validation.feedback,
      selected_option: validation.selected_option,
      step_output_type: validation.step_output_type,
      validation_status: validation.validation_status,
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

