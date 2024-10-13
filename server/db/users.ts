// server/db/users.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { Users } from '../../types/backendTypes';

export const users = {
  async getUsersByOrgID(org_id: string): Promise<Users[]> {
    const query = `
      SELECT *
      FROM users
      WHERE org_id = $1
    `;
    const result = await dbclient.query(query, [org_id]);
    return result.rows;
  },

  async getUser(userID: string): Promise<Users> {
    const query = `
      SELECT *
      FROM users
      WHERE id = $1
    `;
    const result = await dbclient.query(query, [userID]);
    return result.rows[0];
  }
};