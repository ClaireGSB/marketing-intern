import { defineEventHandler } from 'h3'
import { contentOutputs } from '../../../db/contentOutputs'
// import { ContentOutput } from '../../../types/backendTypes'

export default defineEventHandler(async (event) => {
  console.log('event:', event)
  console.log('event.context:', event.context)
  console.log('event.context.params:', event.context.params)
  const orgId = event.context.params?.orgId

  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID is required',
    })
  }

  try {
    const dbClient = event.context.db
    const contentOutputsByOrg = await contentOutputs.getContentOutputsByOrgId(orgId)
    console.log('contentOutputsByOrg:', contentOutputsByOrg)

    return {
      statusCode: 200,
      body: contentOutputsByOrg,
    }
  } catch (error) {
    console.error('Error fetching content outputs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching content outputs',
    })
  }
})