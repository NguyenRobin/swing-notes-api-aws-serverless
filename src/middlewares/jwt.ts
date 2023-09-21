const jwt = require('jsonwebtoken');
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export type UserEmail = string;

export function createToken(email: UserEmail) {
  const token: string = jwt.sign(
    { email: email },
    `${process.env.SECRET_KEY}`,
    {
      expiresIn: '1h',
    }
  );
  console.log(token);
  return token;
}

// export function validateToken(token: string): boolean {
//   const isTokenValid = jwt.verify(token, `${process.env.SECRET_KEY}`);
//   if (isTokenValid) {
//     return true;
//   } else {
//     return false;
//   }
// }

export const validateToken = (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request) => {
    try {
      const token = request?.event?.headers?.authorization
        ?.replace('Bearer ', '')
        .trim();

      if (!token) {
        throw {
          httpErrorCode: 401,
          message: 'Token most be provided in headers',
        };
      }
      const isTokenValid = await jwt.verify(token, `${process.env.SECRET_KEY}`);
      console.log('isTokenValid', isTokenValid);
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
