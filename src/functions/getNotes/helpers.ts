import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';

export async function getNotes() {
  const command = new ScanCommand({
    TableName: 'SwingNotes',
    FilterExpression: 'begins_with(PK, :PK) and begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'u#' },
      ':SK': { S: 'n#' },
    },
  });

  try {
    const response = await db.send(command);
    return response.Items;
  } catch (error) {
    throw error;
  }
}
