// server/api/content-subtype/[orgId].get.ts

import { defineEventHandler } from 'h3'
import { contentSubtypes } from '../../db/contentSubtypes'
import { ContentSubType as ContentSubTypeFrontend } from '../../../types/frontendTypes'

export default defineEventHandler(async (event) => {

  // TO DO: replace this with auth check 
  const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID is required',
    })
  }

  try {
    const dbClient = event.context.db
    const contentSubtypeList = await contentSubtypes.getContentSubtypesByOrgId(orgId)

    // Ensure the data matches the ContentSubTypeFrontend interface
    const contentSubtypesFrontend: ContentSubTypeFrontend[] = contentSubtypeList.map(subtype => ({
      id: subtype.id,
      org_id: subtype.org_id,
      content_type_id: subtype.content_type_id,
      name: subtype.name,
      context: subtype.context,
      guidelines: subtype.guidelines,
      target_audience: subtype.target_audience,
    }))

    return {
      statusCode: 200,
      body: contentSubtypesFrontend,
    }
  } catch (error) {
    console.error('Error fetching content subtypes:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching content subtypes',
    })
  }
})