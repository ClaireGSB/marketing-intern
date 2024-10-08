// server/api/content-output/initialize.post.ts

import { defineEventHandler, readBody } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { contentOutputs } from '../../db/contentOutputs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.orgId || !body.createdBy || !body.contentTypeId || !body.contentSubtypeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields for initialization',
      })
    }

    const newContentOutput = await contentOutputs.create({
      org_id: body.orgId,
      created_by: body.createdBy,
      content_type_id: body.contentTypeId,
      content_subtype_id: body.contentSubtypeId,
      content: '',  // Initialize with empty content
      status: 'draft',  // Initial status
    })

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