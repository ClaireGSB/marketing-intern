// server/api/example/delete.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { examples } from '../../db/examples';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    console.log('body:', body)

    const id = body.id
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing example ID',
      })
    }

    const isDeleted = await examples.delete(id)

    if (!isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Example not found or already deleted',
      })
    }

    return {
      statusCode: 200,
      body: { message: 'Example successfully deleted' },
    }
  } catch (error) {
    console.error('Error deleting example:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting example',
    })
  }
})
