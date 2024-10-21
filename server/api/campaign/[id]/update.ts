// server/api/example/update.ts

import { defineEventHandler, readBody, H3Event } from 'h3'
import { campaigns } from '~/server/db/campaigns';
import { Campaign as CampaignFrontend } from '~/types/frontendTypes';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    console.log('body:', body)

    // TO DO: replace this with auth check
    const userId = '7c9e6679-7425-40de-954b-e07fc1f90ae7'

    const id = event.context.params?.id;
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing example ID',
      })
    }

    if (!body.name && !body.action && !body.guidelines && !body.context && !body.action_inputs) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No update data provided',
      })
    }

    const updatedCampaign = await campaigns.update(id, {
      ...(body.name && { name: body.name }),
      ...(body.action && { action: body.action }),
      ...(body.guidelines && { guidelines: body.guidelines }),
      ...(body.context && { context: body.context }),
      ...(body.action_inputs && { action_inputs: body.action_inputs }),
      updated_by: userId,
    })

    if (!updatedCampaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found',
      })
    }

    // map the data to the frontend type
    const formattedCampaign: CampaignFrontend = {
      id: updatedCampaign.id,
      org_id: updatedCampaign.org_id,
      created_by: updatedCampaign.created_by,
      updated_by: updatedCampaign.updated_by,
      name: updatedCampaign.name,
      action: updatedCampaign.action,
      guidelines: updatedCampaign.guidelines,
      context: updatedCampaign.context,
      action_inputs: updatedCampaign.action_inputs,
      created_at: updatedCampaign.created_at,
      updated_at: updatedCampaign.updated_at,
    }

    return {
      statusCode: 200,
      body: formattedCampaign,
    }
  } catch (error) {
    console.error('Error updating Campaign:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating Campaign',
    })
  }
})