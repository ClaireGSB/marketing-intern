// server/api/content-subtype/update.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { contentSubtypes } from '../../db/contentSubtypes';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    console.log('body:', body)

    // TO DO: replace this with auth check
    const userId = '7c9e6679-7425-40de-954b-e07fc1f90ae7'

    const id = body.id
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing content subtype ID',
      })
    }

    if (!body.name && !body.context && !body.guidelines && !body.target_audience) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No update data provided',
      })
    }

    const updatedContentSubtype = await contentSubtypes.update(id, {
      ...(body.name && { name: body.name }),
      ...(body.context && { context: body.context }),
      ...(body.guidelines && { guidelines: body.guidelines }),
      ...(body.target_audience && { target_audience: body.target_audience }),
      updated_by: userId,
    })

    if (!updatedContentSubtype) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content subtype not found',
      })
    }

    return {
      statusCode: 200,
      body: updatedContentSubtype,
    }
  } catch (error) {
    console.error('Error updating content subtype:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating content subtype',
    })
  }
})