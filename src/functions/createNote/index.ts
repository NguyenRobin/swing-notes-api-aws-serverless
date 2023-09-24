import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { randomUUID } from 'crypto';
import { getToken, validateToken, verifyToken } from '../../middlewares/jwt';
import { validateBody } from '../../middlewares/validateBody';
import { NoteBody } from '../../middlewares/validateBody';
import { NewNote, createNote } from './helpers';

async function lambda(event: APIGatewayProxyEvent) {
  try {
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
    await createNote(note);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Note successfully added to database!',
      }),
    };
  } catch (error: any) {
    return {
      statusCode: error.httpErrorCode || 200,
      body: JSON.stringify({
        message: error.message || 'Internal server error',
      }),
    };
  }
}

export const handler = middy(lambda)
  .use(validateToken())
  .use(jsonBodyParser())
  .use(validateBody());
