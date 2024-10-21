// server/api/campaign/[id]/delete.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { campaigns } from '~/server/db/campaigns';

export default defineEventHandler(async (event: H3Event) => {
  try {


    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing campaign ID',
      })
    }

    const isDeleted = await campaigns.delete(id)

    if (!isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'campaign not found or already deleted',
      })
    }

    return {
      statusCode: 200,
      body: { message: 'campaign successfully deleted' },
    }
  } catch (error) {
    console.error('Error deleting campaign:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting campaign',
    })
  }
})
