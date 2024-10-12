// server/api/content-output/initialize.post.ts

import { defineEventHandler, readBody } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { contentOutputs } from '../../db/contentOutputs'

export default defineEventHandler(async (event) => {
  console.log('API received a new initialization request')
  try {
    const body = await readBody(event)

    if (!body.content_subtype_id) {
      // TO DO: more checks here
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields for initialization',
      })
    }

    // Generate a new UUID for the content output
    const id = uuidv4()

    // TO DO: replace this with auth check 
    const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
    const userId = '7c9e6679-7425-40de-954b-e07fc1f90ae7'

    const contentOutputData = {
      id,
      org_id: orgId,
      created_by: userId,
      content_type_id: body.content_type_id,
      content_subtype_id: body.content_subtype_id,
      content: '',  // Initialize with empty content
      status: 'generating' as const, // Ensure this is one of the valid status values
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const userInput = body

    const newContentOutput = await contentOutputs.create(
      contentOutputData,
      userInput,
    )

    console.log('New content output initialized:', newContentOutput)

    return {
      statusCode: 201,
      body: newContentOutput,
    }
  } catch (error) {
    console.error('Error initializing content output:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error initializing content output',
    })
  }
})