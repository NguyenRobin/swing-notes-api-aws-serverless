import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { findEmail, signupUser, User } from './helpers';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { email, password } = event.body as unknown as User;
    const pk = 'u#' + email;
    const sk = 'u#' + email;
    const entityType = 'users';
    const date = new Date().toLocaleDateString();

    const user: User = {
      pk,
      sk,
      entityType,
      email,
      password,
      createdAt: date,
    };

    const emailExist = await findEmail(email);

    if (!emailExist || !emailExist.length) {
      await signupUser(user);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'User successfully added to database!',
        }),
      };
    } else {
      throw { httpErrorCode: 404, message: 'User already exists' };
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

export const handler = middy(lambda).use(jsonBodyParser());
