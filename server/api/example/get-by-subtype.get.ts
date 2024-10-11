// server/api/example/get-by-subtype.get.ts

import { defineEventHandler } from 'h3'
import { Example as ExampleFrontend } from '../../../types/frontendTypes';
import { examples } from '~/server/db/examples';

export default defineEventHandler(async (event) => {

  try {
    const body = await readBody(event);
    console.log('body:', body);
    const subtypeId = body.subtypeId;
    if (!subtypeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing content subtype ID',
      })
    }

    // TO DO: replace this with auth check 
    const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required',
      })
    }


    const examplesBySubtype = await examples.getByContentSubtypeId(subtypeId)

    // Ensure the data matches the ExampleFrontend interface
    const formattedExamples: ExampleFrontend[] = examplesBySubtype.map(example => ({
      id: example.id,
      content_subtype_id: example.content_subtype_id,
      content: example.content,
      example_type: example.example_type,
      explanation: example.explanation,
      name: example.name,
    }))

    return {
      statusCode: 200,
      body: formattedExamples,
    }
  } catch (error) {
    console.error('Error fetching examples:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching examples',
    })
  }
})

