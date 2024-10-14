import { defineEventHandler } from 'h3'
import { subtypeSettingsHistory } from '~/server/db/subtypeSettingsHistory'
import { SettingsInput as SettingsInputFrontend } from '~/types/frontendTypes'

export default defineEventHandler(async (event) => {

  try {

    console.log('API received a request get subtype settings history')
    // TO DO: replace this with auth check 
    const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required',
      })
    }


    const contentOutputID = event.context.params?.id;
    
    if (!contentOutputID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing content output ID',
      })
    }

    const settings = await subtypeSettingsHistory.getSSHByContentOutputID(contentOutputID)
    
    if(!settings) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Error confirming validations',
      })
    }

    // Ensure the data matches the UserInputFrontend interface
    const formattedSettings: SettingsInputFrontend = {
      id: settings.id,
      target_audience: settings.target_audience || '',
      guidelines: settings.guidelines || '',
      context: settings.context || '',
      examples: settings.examples || '',
    }


    return {
      statusCode: 200,
      body: formattedSettings,
    }

  } catch (error) {
    console.error('Error getting project setup', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'getting project setup',
    })
  }
})
