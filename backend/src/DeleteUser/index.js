const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sqs = new SQSClient({});
const response = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
exports.handler = async event => {
  let payload;
  try { payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {}; } catch { return response(400, { message: 'El cuerpo debe ser JSON valido' }); }
  const id = event.pathParameters?.id || payload.id;
  if (!id) return response(400, { message: 'El id es obligatorio' });
  try {
    const result = await db.send(new DeleteCommand({ TableName: process.env.USERSTABLE_TABLE_NAME, Key: { id }, ConditionExpression: 'attribute_exists(id)', ReturnValues: 'ALL_OLD' }));
    await sqs.send(new SendMessageCommand({ QueueUrl: process.env.DELETEUSERSQUEUE_QUEUE_URL, MessageBody: JSON.stringify(result.Attributes) }));
    return response(200, result.Attributes);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return response(404, { message: 'Usuario no encontrado' });
    console.error('Error eliminando usuario', error); return response(500, { message: 'No fue posible eliminar el usuario' });
  }
};
