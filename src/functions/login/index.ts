import { APIGatewayProxyEvent } from 'aws-lambda';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import middy from '@middy/core';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';
import { createToken } from '../../middlewares/jwt';

interface UserCredentials extends APIGatewayProxyEvent {
  email: string;
  password: string;
}

type Boolean = true | false;

async function login(email: string, password: string | undefined) {
  const command = new QueryCommand({
    TableName: 'swingNotes',
    KeyConditionExpression: 'partitionKey = :pk AND sortKey = :sk',
    ExpressionAttributeValues: {
      ':pk': { S: email },
      ':sk': { S: 'u#' + email },
    },
  });

  try {
    const response = await db.send(command);
    const passwordsIsMatching: Boolean =
      response.Items?.at(0)?.password.S === password;

    if (passwordsIsMatching) {
      return createToken({ email: response.Items?.at(0)?.email.S! });
    }
  } catch (error) {
    console.log(error);
  }
}

async function loginHandler(event: APIGatewayProxyEvent) {
  const { email, password } = event.body as unknown as UserCredentials;
  try {
    const userAuthenticationToken = await login(email, password);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, token: userAuthenticationToken }),
    };
  } catch (error) {}
}

export const handler = middy(loginHandler).use(httpJsonBodyParser());
