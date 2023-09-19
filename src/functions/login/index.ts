import { APIGatewayProxyEvent } from 'aws-lambda';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import middy from '@middy/core';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';

interface UserCredentials extends APIGatewayProxyEvent {
  email: string;
  password: string;
}

interface UserProperties {
  partitionKey: string;
  sortKey: string;
  entityType: string;
  password: string;
  createdAt: string;
  username: string;
  email: string;
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

    if (response) {
      const passwordsIsMatching: Boolean =
        response.Items?.at(0)?.password.S === password;
      return passwordsIsMatching;
    }
  } catch (error) {
    console.log(error);
  }
}

async function loginHandler(event: APIGatewayProxyEvent) {
  const { email, password } = event.body as unknown as UserCredentials;
  console.log(password);
  try {
    await login(email, password);
  } catch (error) {}
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(
  //     {
  //       message: 'Go Serverless v3.0! Your function executed successfully!',
  //       input: event,
  //     },
  //     null,
  //     2
  //   ),
  // };
}

export const handler = middy(loginHandler).use(httpJsonBodyParser());
