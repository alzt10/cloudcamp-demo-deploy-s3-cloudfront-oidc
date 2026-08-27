const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});
const tableName = process.env.USERSTABLE_TABLE_NAME;
const topicArn = process.env.USERSTOPIC_TOPIC_ARN;
const fields = ['nombre', 'apellidos', 'celular', 'correo'];
const response = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });

exports.handler = async event => {
  let payload;
  try { payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {}; } catch { return response(400, { message: 'El cuerpo debe ser JSON valido' }); }
  const id = event.pathParameters?.id || payload.id;
  const values = Object.fromEntries(fields.map(field => [field, String(payload[field] || '').trim()]));
  if (!id || fields.some(field => !values[field]) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.correo)) return response(400, { message: 'id y todos los datos del usuario son obligatorios' });
  try {
    const result = await db.send(new UpdateCommand({
      TableName: tableName, Key: { id },
      UpdateExpression: 'SET #nombre = :nombre, apellidos = :apellidos, celular = :celular, correo = :correo, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#nombre': 'nombre' }, ExpressionAttributeValues: { ...Object.fromEntries(Object.entries(values).map(([key, value]) => [`:${key}`, value])), ':updatedAt': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(id)', ReturnValues: 'ALL_NEW',
    }));
    await sns.send(new PublishCommand({ TopicArn: topicArn, Message: 'Se libran el dia de hoy del profe alejo' }));
    return response(200, result.Attributes);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return response(404, { message: 'Usuario no encontrado' });
    console.error('Error actualizando usuario', error); return response(500, { message: 'No fue posible actualizar el usuario' });
  }
};
