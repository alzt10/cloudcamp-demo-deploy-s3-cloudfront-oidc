const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const response = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
exports.handler = async event => {
  const id = event.pathParameters?.id;
  if (!id) return response(400, { message: 'El id es obligatorio' });
  try {
    const result = await db.send(new GetCommand({ TableName: process.env.USERSTABLE_TABLE_NAME, Key: { id } }));
    return result.Item ? response(200, result.Item) : response(404, { message: 'Usuario no encontrado' });
  } catch (error) { console.error('Error obteniendo usuario', error); return response(500, { message: 'No fue posible obtener el usuario' }); }
};
