import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { UserEmail, createToken } from '../../middlewares/jwt';
import { checkIsPasswordsMatching, findUserByEmail } from './helpers';

interface UserCredentials extends APIGatewayProxyEvent {
  email: string;
  password: string;
}

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { email, password } = event.body as unknown as UserCredentials;
    if (!email || !password) {
      throw { httpErrorCode: 401, message: 'email and password is required' };
    }
    const user = await findUserByEmail(email);
    const userPassword = user?.at(0)?.Password.S;
    const userEmail: UserEmail = user?.at(0)?.Email.S!;

    if (user && userPassword) {
      const passwordsIsMatching = checkIsPasswordsMatching(
        userPassword,
        password
      );

      if (passwordsIsMatching && userEmail) {
        const token = createToken(userEmail);
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, token }),
        };
      }
    }
  } catch (error: any) {
    return {
      statusCode: error.httpErrorCode || 500,
      body: JSON.stringify({
        message: error.message || 'Internal server error',
      }),
    };
  }
}

export const handler = middy(lambda).use(httpJsonBodyParser());
