import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../services/db';
import {
  getToken,
  validateToken,
  verifyTokenOwner,
} from '../../middlewares/jwt';
import { findNote } from '../deleteNote/helpers';

interface NoteUpdate {
  title?: string;
  text?: string;
}
type PathParameters = {
  noteId: string;
};

function filterOutProperties(body: Record<string, any>): NoteUpdate {
  const acceptedProperties = ['title', 'text'];
  const resultObj = {} as Record<string, any>;
  for (const property of acceptedProperties) {
    if (body.hasOwnProperty(property)) {
      resultObj[property] = body[property];
    }
  }
  console.log(resultObj);
  return resultObj;
}

function createExpression(body: any) {
  const date = new Date().toISOString();
  let expression = {
    updateExpression: 'SET',
    expressionAttributeNames: {} as Record<string, any>,
    expressionAttributeValues: {} as Record<string, any>,
  };

  for (const [key, value] of Object.entries(body)) {
    const property = key[0].toUpperCase() + key.slice(1);
    expression.updateExpression += ` #${property}  = :${property},`;
    expression.expressionAttributeNames[`#${property}`] = `${property}`;
    expression.expressionAttributeValues[`:${property}`] = { S: value };
  }
  expression.updateExpression += ` #ModifiedAt = :ModifiedAt`;
  expression.expressionAttributeNames = {
    ...expression.expressionAttributeNames,
    '#ModifiedAt': 'ModifiedAt',
  };
  expression.expressionAttributeValues = {
    ...expression.expressionAttributeValues,
    ':ModifiedAt': { S: date },
  };

  return expression;
}

async function updateNote(email: string, noteId: string, body: any) {
  const expression = createExpression(body);
  const command = new UpdateItemCommand({
    TableName: 'SwingNotes',
    Key: { PK: { S: 'u#' + email }, SK: { S: 'n#' + noteId } },
    UpdateExpression: expression.updateExpression,
    ExpressionAttributeNames: expression.expressionAttributeNames,
    ExpressionAttributeValues: expression.expressionAttributeValues,
  });

  const response = await db.send(command);
  console.log(response);
  return response;
}
async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { noteId } = event.pathParameters as unknown as PathParameters;
    const body = filterOutProperties(event.body as NoteUpdate);
    const token = getToken(event)!;
    const tokenOwner = await verifyTokenOwner(token);
    const email = tokenOwner.email.trim();
    const note = await findNote(email, noteId);

    if (note) {
      await updateNote(email, noteId, body);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: `Note #${noteId} has been updated`,
        }),
      };
    }
  } catch (error: any) {
    return {
      statusCode: error.httpErrorCode || 500,
      body: JSON.stringify({
        message: error.message || 'Internal server error',
      }),
    };
  }
}

export const handler = middy(lambda)
  .use(httpJsonBodyParser())
  .use(validateToken());
