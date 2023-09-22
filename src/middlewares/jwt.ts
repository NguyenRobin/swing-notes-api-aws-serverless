const jwt = require('jsonwebtoken');
import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

export type UserEmail = string;

export function createToken(email: UserEmail) {
  const token: string = jwt.sign(
    { email: email },
    `${process.env.SECRET_KEY}`,
    {
      expiresIn: '1h',
    }
  );
  return token;
}

export const validateToken = (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request) => {
    try {
      const token = request?.event?.headers?.authorization
        ?.replace('Bearer ', '')
        .trim();

      if (!token) {
        throw {
          httpErrorCode: 401,
          message: 'Valid token most be provided in headers',
        };
      }

      const isTokenValid = await jwt.verify(token, `${process.env.SECRET_KEY}`);

      if (!isTokenValid) {
        throw { httpErrorCode: 401, message: 'Invalid token' };
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
