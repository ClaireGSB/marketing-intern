import { defineEventHandler, readBody, H3Event } from 'h3'
import { contentOutputs } from '../../db/contentOutputs';

export default defineEventHandler(async (event: H3Event) => {
  try {

    const body = await readBody(event)

    console.log('body:', body)

    const id = body.id
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing content output ID',
      })
    }

    if (!body.content && !body.status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No update data provided',
      })
    }

    const updatedContentOutput = await contentOutputs.update(id, {
      ...(body.content && { content: body.content }),
      ...(body.status && { status: body.status }),
    })

    if (!updatedContentOutput) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content output not found',
      })
    }

    return {
      statusCode: 200,
      body: updatedContentOutput,
    }
  } catch (error) {
    console.error('Error updating content output:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating content output',
    })
  }
})