const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.USERSTABLE_TABLE_NAME;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async event => {
  console.log(JSON.stringify(event, undefined, 2));

  const id = event.pathParameters && event.pathParameters.id;
  if (!id) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'id es requerido' }) };
  }

  try {
    const result = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    if (!result.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ message: 'Usuario no encontrado' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify(result.Item) };
  } catch (err) {
    console.error('Error obteniendo usuario', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'No se pudo obtener el usuario' }) };
  }
};
