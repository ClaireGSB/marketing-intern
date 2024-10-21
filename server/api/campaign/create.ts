// server/api/campaign/create.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { campaigns } from '../../db/campaigns';
import { Campaign as CampaignFrontend } from '~/types/frontendTypes';
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    console.log('API received a new Campaign creation request:', body)

    if (!body.name ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields for campaign creation',
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

    // Generate a new UUID for the campaign
    const id = uuidv4()

    const newCampaign = await campaigns.create({
      id,
      org_id: orgId,
      created_by: userId,
      updated_by: userId,
      name: body.name,
      action: body.action,
      guidelines: body.guidelines || null,
      context: body.context || null,
      action_inputs: body.action_inputs || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })

    // map the data to the frontend type
    const formattedCampaign: CampaignFrontend = {
      id: newCampaign.id,
      org_id: newCampaign.org_id,
      created_by: newCampaign.created_by,
      updated_by: newCampaign.updated_by,
      name: newCampaign.name,
      action: newCampaign.action,
      guidelines: newCampaign.guidelines,
      context: newCampaign.context,
      action_inputs: newCampaign.action_inputs,
      created_at: newCampaign.created_at,
      updated_at: newCampaign.updated_at,
    }

    console.log('New campaign created:', formattedCampaign)

    return {
      statusCode: 201,
      body: formattedCampaign,
    }
  } catch (error) {
    console.error('Error creating campaign:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating campaign',
    })
  }
})
