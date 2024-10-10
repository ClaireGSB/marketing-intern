// server/api/content-subtype/create.ts

import { defineEventHandler, readBody } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { contentSubtypes } from '../../db/contentSubtypes'
import { ContentSubType } from '../../../types/backendTypes'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('Content Subtype creation request body:', body)

    if (!body.content_type_id || !body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields for content subtype creation',
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

    // Generate a new UUID for the content subtype
    const id = uuidv4()

    const newContentSubtype: ContentSubType = {
      id,
      org_id: orgId,
      content_type_id: body.content_type_id,
      name: body.name,
      context: body.context || null,
      guidelines: body.guidelines || null,
      target_audience: body.target_audience || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: body.createdBy || null,
      deleted_at: null,
    }

    const createdContentSubtype = await contentSubtypes.create(newContentSubtype)

    console.log('New content subtype created:', createdContentSubtype)

    return {
      statusCode: 201,
      body: createdContentSubtype,
    }
  } catch (error) {
    console.error('Error creating content subtype:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating content subtype',
    })
  }
})