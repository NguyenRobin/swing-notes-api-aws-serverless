import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

interface NoteBody {
  // PK: string;
  // SK: string;
  title: string;
  text: string;
  // EntityType: string;
  // CreatedAt: string;
  // Modified?: string;
}
export const validateBody = (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request) => {
    try {
      const body = request?.event?.body;
      if (
        !body ||
        !body.hasOwnProperty('title') ||
        !body.hasOwnProperty('text') ||
        typeof body !== 'object' ||
        body === null
      ) {
        throw { httpErrorCode: 401, message: 'title and text is required' };
      }
      // if (requestBody !== null && typeof requestBody === 'object') {
      //   const { title, text }: NoteBody = requestBody;
      // }
      // if (!title || !text) {
      //   throw { httpErrorCode: 401, message: 'title and text is required' };
      // }
    } catch (error: any) {
      return {
        statusCode: error.httpErrorCode || 500,
        body: JSON.stringify({ message: error.message }),
      };
    }
  };
  return { before };
};
