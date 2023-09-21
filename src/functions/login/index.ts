import { APIGatewayProxyEvent } from 'aws-lambda';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import middy from '@middy/core';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';
import { UserEmail, createToken } from '../../middlewares/jwt';

interface UserCredentials extends APIGatewayProxyEvent {
  email: string;
  password: string;
}

type Boolean = true | false;

function checkIsPasswordsMatching(
  userPassword: string,
  enteredPassword: string
) {
  const passwordsIsMatching: Boolean = userPassword === enteredPassword;

  try {
    if (!passwordsIsMatching) {
      throw { httpErrorCode: 404, message: 'Password not matching' };
    }
    return passwordsIsMatching;
  } catch (error) {
    throw error;
  }
}

async function findUserByEmail(email: string) {
  const command = new QueryCommand({
    TableName: 'SwingNotes',
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': { S: 'u#' + email },
      ':sk': { S: 'u#' + email },
    },
  });
  try {
    const { Items: user } = await db.send(command);
    if (!user || !user.length) {
      throw { httpErrorCode: 401, message: 'Email not found!' };
    }
    return user;
  } catch (error: any) {
    throw error;
  }
}

async function loginHandler(event: APIGatewayProxyEvent) {
  const { email, password } = event.body as unknown as UserCredentials;
  if (!email || !password) {
    throw { httpErrorCode: 400, message: 'email and password is required' };
  }

  try {
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
export const handler = middy(loginHandler).use(httpJsonBodyParser());
