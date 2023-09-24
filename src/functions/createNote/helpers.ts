import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';

export interface NewNote {
  pk: string;
  sk: string;
  entityType: string;
  title: string;
  text: string;
  createdAt: string;
  modified?: string;
  [key: string]: any;
}

export async function createNote(newNote: NewNote) {
  const command = new PutItemCommand({
    TableName: 'SwingNotes',
    Item: {
      PK: { S: newNote.pk },
      SK: { S: newNote.sk },
      EntityType: { S: newNote.entityType },
      Title: { S: newNote.title },
      Text: { S: newNote.text },
      CreatedAt: { S: newNote.createdAt },
    },
  });
  try {
    const response = await db.send(command);
    if (!response) {
      throw {
        httpErrorCode: 400,
        message: 'Could not send createNote request to database',
      };
    }
  } catch (error) {
    throw error;
  }
}
