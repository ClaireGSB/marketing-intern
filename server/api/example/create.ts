// server/api/example/create.ts


import { defineEventHandler, readBody } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { examples } from '../../db/examples'

export default defineEventHandler(async (event) => {
  
  try {
    const body = await readBody(event)
    console.log('API received a new example creation request:', body)

    if (!body.example_type || !body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields for example creation',
      })
    }

    // TO DO: replace this with auth check 
    const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
    const userId = '7c9e6679-7425-40de-954b-e07fc1f90ae7'

    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required',
      })
    }

    // Generate a new UUID for the example
    const id = uuidv4()

    const newExample = await examples.create({
      id,
      org_id: orgId,
      created_by: userId,
      updated_by: userId,
      content_subtype_id: body.content_subtype_id || null,
      content_output_id: body.contentOutputId,
      example_type: body.example_type,
      name: body.name,
      content: body.content || null,
      explanation: body.explanation || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })

    console.log('New example created:', newExample)

    return {
      statusCode: 201,
      body: newExample,
    }
  } catch (error) {
    console.error('Error creating example:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating example',
    })
  }
})