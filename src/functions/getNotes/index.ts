import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';

import { validateToken } from '../../middlewares/jwt';
import { getNotes } from './helpers';

async function getNotesHandler(event: APIGatewayProxyEvent) {
  try {
    const notes = await getNotes();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result: notes?.length, notes }),
    };
  } catch (error: any) {
    return {
      statusCode: error.httpErrorCode || 500,
      body: JSON.stringify({
        message: error.message || 'Internal server error',
      }),
    };
  }
}

export const handler = middy(getNotesHandler).use(validateToken());
