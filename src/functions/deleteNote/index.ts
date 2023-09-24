import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  getToken,
  validateToken,
  verifyTokenOwner,
} from '../../middlewares/jwt';
import { deleteNote, findNote } from './helpers';

type PathParameters = {
  noteId: string;
};

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { noteId } = event.pathParameters as unknown as PathParameters;
    const token = getToken(event)!;
    const tokenOwner = await verifyTokenOwner(token);
    const email = tokenOwner.email.trim();
    const note = await findNote(email, noteId);
    if (note) {
      await deleteNote(email, noteId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Note successfully deleted',
        }),
      };
    }
  } catch (error: any) {
    return {
      statusCode: error.httpErrorCode || 200,
      body: JSON.stringify({
        message: error.message || 'Internal server error',
      }),
    };
  }
}

export const handler = middy(lambda).use(validateToken());
