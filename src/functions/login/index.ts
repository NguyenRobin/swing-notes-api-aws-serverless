import { APIGatewayAuthorizerEvent } from 'aws-lambda';

module.exports.handler = async (event: APIGatewayAuthorizerEvent) => {
  console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v3.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};
