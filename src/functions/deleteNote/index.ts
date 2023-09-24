import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
async function lambda(event: APIGatewayProxyEvent) {}

export const handler = middy();
