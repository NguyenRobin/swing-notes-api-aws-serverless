import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../services/db';

export const handler = async (event: APIGatewayProxyEvent) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event }),
  };
};
