// server/db/stepOutputs.ts

import { v4 as uuidv4 } from 'uuid';
import dbclient from '../database';
import { StepOutput } from '../../types/backendTypes';

export const stepOutput = {
  async create(stepOutput: Omit<StepOutput, 'id'>): Promise<StepOutput> {
    const id = uuidv4();
    const query = `
      INSERT INTO step_output (id, index, content_output_id, step_name, step_output_type, step_status, step_output)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      id,
      stepOutput.index,
      stepOutput.content_output_id,
      stepOutput.step_name,
      stepOutput.step_output_type,
      stepOutput.step_status,
      JSON.stringify(stepOutput.step_output)
    ];
    const result = await dbclient.query(query, values);
    return result.rows[0];
  },

  async update(id: string, status: StepOutput['step_status'], output: StepOutput['step_output']): Promise<StepOutput | null> {
    const query = `
      UPDATE step_output
      SET step_status = $2, step_output = $3
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, status, JSON.stringify(output)];
    const result = await dbclient.query(query, values);
    return result.rows[0] || null;
  }
};