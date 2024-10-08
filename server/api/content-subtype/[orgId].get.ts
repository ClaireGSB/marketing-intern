// server/api/content-subtype/[orgId].get.ts

import { defineEventHandler } from 'h3'
import { contentSubtypes } from '../../db/contentSubtypes'

export default defineEventHandler(async (event) => {
  const orgId = event.context.params?.orgId

  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID is required',
    })
  }

  try {
    const dbClient = event.context.db
    const contentSubtypeList = await contentSubtypes.getContentSubtypesByOrgId(orgId)

    return {
      statusCode: 200,
      body: contentSubtypes,
    }
  } catch (error) {
    console.error('Error fetching content subtypes:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching content subtypes',
    })
  }
})