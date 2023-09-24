import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';

export interface User {
  pk: string;
  sk: string;
  entityType: string;
  email: string;
  password: string;
  createdAt: string;
  modified?: string;
  [key: string]: any;
}

export async function findEmail(email: string) {
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
    return user;
  } catch (error: any) {
    throw error;
  }
}

export async function signupUser(user: User) {
  const command = new PutItemCommand({
    TableName: 'SwingNotes',
    Item: {
      PK: { S: user.pk },
      SK: { S: user.sk },
      EntityType: { S: user.entityType },
      Email: { S: user.email },
      Password: { S: user.password },
      CreatedAt: { S: user.createdAt },
    },
  });
  try {
    const response = await db.send(command);
    console.log(response);
    if (!response) {
      throw {
        httpErrorCode: 400,
        message: 'Could not send signup request to database',
      };
    }
  } catch (error) {
    throw error;
  }
}
