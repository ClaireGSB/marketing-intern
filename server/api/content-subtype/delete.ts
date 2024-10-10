// server/api/content-subtype/delete.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { contentSubtypes } from '../../db/contentSubtypes';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    console.log('body:', body)

    const id = body.id
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing content subtype ID',
      })
    }

    const isDeleted = await contentSubtypes.delete(id)

    if (!isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content subtype not found or already deleted',
      })
    }

    return {
      statusCode: 200,
      body: { message: 'Content subtype successfully deleted' },
    }
  } catch (error) {
    console.error('Error deleting content subtype:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting content subtype',
    })
  }
})