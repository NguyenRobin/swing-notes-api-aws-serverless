import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';

type Boolean = true | false;

export function checkIsPasswordsMatching(
  userPassword: string,
  enteredPassword: string
) {
  const passwordsIsMatching: Boolean = userPassword === enteredPassword;

  try {
    if (!passwordsIsMatching) {
      throw { httpErrorCode: 404, message: 'Password not matching' };
    }
    return passwordsIsMatching;
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email: string) {
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
    if (!user || !user.length) {
      throw { httpErrorCode: 401, message: 'Email not found!' };
    }
    return user;
  } catch (error: any) {
    throw error;
  }
}
