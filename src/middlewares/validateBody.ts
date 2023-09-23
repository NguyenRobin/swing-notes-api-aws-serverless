import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

interface NoteBody {
  title?: string;
  text?: string;
}
export const validateBody = (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request) => {
    try {
      const rawBody = request?.event?.body as NoteBody;
      if (!rawBody) {
        throw { httpErrorCode: 400, message: 'Request body is missing' };
      }
      const { title, text } = rawBody;
      if (!title || !text) {
        throw {
          httpErrorCode: 401,
          message: 'title and text must included in body',
        };
      }
    } catch (error: any) {
      return {
        statusCode: error.httpErrorCode || 500,
        body: JSON.stringify({ message: error.message }),
      };
    }
  };
  return { before };
};
