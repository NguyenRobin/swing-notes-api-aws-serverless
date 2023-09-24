import { DeleteItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';

export async function findNote(email: string, noteId: string) {
  const command = new QueryCommand({
    TableName: 'SwingNotes',
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': { S: 'u#' + email },
      ':sk': { S: 'n#' + noteId },
    },
  });

  try {
    const { Items } = await db.send(command);
    if (!Items || !Items.length) {
      throw { httpErrorCode: 401, message: 'Note not found' };
    }
    return Items;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteNote(email: string, noteId: string) {
  const command = new DeleteItemCommand({
    TableName: 'SwingNotes',
    Key: { PK: { S: 'u#' + email }, SK: { S: 'n#' + noteId } },
  });

  const response = await db.send(command);
  console.log('response', response);
  return response;
}
