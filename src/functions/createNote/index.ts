import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../services/db';
import middy from '@middy/core';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { getToken, validateToken, verifyToken } from '../../middlewares/jwt';
import jsonBodyParser from '@middy/http-json-body-parser';
import { validateBody } from '../../middlewares/validateBody';
import { randomUUID } from 'crypto';
import { NoteBody } from '../../middlewares/validateBody';
interface NewNote {
  pk: string;
  sk: string;
  entityType: string;
  title: string;
  text: string;
  createdAt: string;
  modified?: string;
  [key: string]: any;
}

async function createNote(newNote: NewNote) {
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
    console.log(response);
  } catch (error) {
    throw error;
  }
}

async function createNoteLambda(event: APIGatewayProxyEvent) {
  const { title, text } = event.body as NoteBody;
  const token = getToken(event)!;
  const tokenOwner = await verifyToken(token);

  const pk = 'u#' + tokenOwner.email.trim();
  const sk = `n#${randomUUID()}`;
  const entityType = 'notes';
  const date = new Date().toLocaleDateString();

  const note: NewNote = {
    pk,
    sk,
    entityType,
    title: title!,
    text: text!,
    createdAt: date,
  };

  console.log('note', note);
  await createNote(note);
  return {
    statusCode: 200,
    body: JSON.stringify({ event }),
  };
}

export const handler = middy(createNoteLambda)
  .use(validateToken())
  .use(jsonBodyParser())
  .use(validateBody());
