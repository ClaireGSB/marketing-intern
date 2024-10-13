// server/api/user/get-by-org.get.ts

import { defineEventHandler } from 'h3'
import { Users as UsersFrontend } from '../../../types/frontendTypes';
import { users } from '~/server/db/users';

export default defineEventHandler(async (event) => {

  try {

    // TO DO: replace this with auth check 
    const orgId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required',
      })
    }

    const userList = await users.getUsersByOrgID(orgId)

    // Ensure the data matches the ExampleFrontend interface
    const formattedUsers: UsersFrontend[] = userList.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_admin: user.is_admin,
      is_org_admin: user.is_org_admin,
    }))

    return {
      statusCode: 200,
      body: formattedUsers,
    }
  } catch (error) {
    console.error('Error fetching examples:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching examples',
    })
  }
})

