// server/api/example/update.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { examples } from '../../db/examples';

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
        statusMessage: 'Missing example ID',
      })
    }

    if (!body.name && !body.content && !body.explanation) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No update data provided',
      })
    }

    const updatedExample = await examples.update(id, {
      ...(body.name && { name: body.name }),
      ...(body.content && { content: body.content }),
      ...(body.explanation && { explanation: body.explanation }),
      updated_by: userId,
    })

    if (!updatedExample) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Example not found',
      })
    }

    return {
      statusCode: 200,
      body: updatedExample,
    }
  } catch (error) {
    console.error('Error updating example:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating example',
    })
  }
})