// server/api/user/get-by-org.get.ts

import { defineEventHandler } from 'h3'
import { Users as UsersFrontend } from '../../../types/frontendTypes';
import { users } from '~/server/db/users';

export default defineEventHandler(async (event) => {

  try {

    // TO DO: replace this with auth check 
    const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
    const userID = '7c9e6679-7425-40de-954b-e07fc1f90ae7'

    if (!userID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userID is required',
      })
    }

    return {
      statusCode: 200,
      body: userID,
    }
  } catch (error) {
    console.error('Error fetching userID:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching userID',
    })
  }
})

