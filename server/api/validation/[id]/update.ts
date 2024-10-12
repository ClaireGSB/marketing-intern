// server/api/validation/[id]/update.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { validations } from '~/server/db/validations';

export default defineEventHandler(async (event: H3Event) => {
  try {

    const id = event.context.params?.id;
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing validation ID',
      })
    }

    const body = await readBody(event)


    const updatedValidation = await validations.update(id, {
      ...(body.feedback && { feedback: body.feedback }),
      ...(body.selected_option && { selected_option: body.selected_option }),
      ...(body.validation_status && { validation_status: body.validation_status }),
    })

    if (!updatedValidation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'validation not found',
      })
    }

    return {
      statusCode: 200,
      body: updatedValidation,
    }
  } catch (error) {
    console.error('Error updating validation:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating validation',
    })
  }
})