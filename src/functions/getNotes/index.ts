import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../services/db';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
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
  } catch (error) {}
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const notes = await getNotes();
  console.log(notes);
  return {
    statusCode: 200,
    body: JSON.stringify({ event, notes }),
  };
};
