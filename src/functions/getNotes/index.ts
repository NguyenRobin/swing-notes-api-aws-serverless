import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/client-dynamodb';

import { db } from '../../services/db';
import { validateToken } from '../../middlewares/jwt';

async function getNotes() {
  const command = new ScanCommand({
    TableName: 'SwingNotes',
    FilterExpression: 'begins_with(PK, :PK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'n#' },
    },
  });

  try {
    const response = await db.send(command);
    console.log(response);
    return response.Items;
  } catch (error) {
    throw error;
  }
}

async function getNotesHandler(event: APIGatewayProxyEvent) {
  try {
    const notes = await getNotes();
    return {
      statusCode: 200,
      body: JSON.stringify({ notes }),
    };
  } catch (error: any) {
    return {
      statusCode: error.httpErrorCode || 500,
      body: JSON.stringify({
        message: error.message || 'Internal server error',
      }),
    };
  }
}

export const handler = middy(getNotesHandler).use(validateToken());
