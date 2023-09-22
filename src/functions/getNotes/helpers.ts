import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';

export async function getNotes() {
  const command = new ScanCommand({
    TableName: 'SwingNotes',
    FilterExpression: 'begins_with(PK, :PK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'n#' },
    },
  });

  try {
    const response = await db.send(command);
    return response.Items;
  } catch (error) {
    throw error;
  }
}
