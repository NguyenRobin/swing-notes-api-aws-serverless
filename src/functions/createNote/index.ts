import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../services/db';
import middy from '@middy/core';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { validateToken } from '../../middlewares/jwt';

// async function createNote() {
//   const command = new PutItemCommand({ TableName: 'SwingNotes' });
//   try {
//     const response = await db.send(command);
//   } catch (error) {}
// }

function createNoteLambda(event: APIGatewayProxyEvent) {
  console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({ event }),
  };
}

export const handler = middy(createNoteLambda).use(validateToken());
