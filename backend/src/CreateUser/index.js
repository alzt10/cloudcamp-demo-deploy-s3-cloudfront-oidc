const crypto = require('node:crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, SubscribeCommand } = require('@aws-sdk/client-sns');

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});
const tableName = process.env.USERSTABLE_TABLE_NAME;
const topicArn = process.env.USERSTOPIC_TOPIC_ARN;
const fields = ['nombre', 'apellidos', 'celular', 'correo'];

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body),
});

exports.handler = async event => {
  let payload;
  try {
    payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
  } catch {
    return response(400, { message: 'El cuerpo debe ser JSON valido' });
  }

  const user = Object.fromEntries(fields.map(field => [field, String(payload[field] || '').trim()]));
  if (fields.some(field => !user[field]) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(user.correo)) {
    return response(400, { message: 'nombre, apellidos, celular y correo valido son obligatorios' });
  }

  const now = new Date().toISOString();
  const item = { id: crypto.randomUUID(), ...user, createdAt: now, updatedAt: now };
  try {
    await db.send(new PutCommand({ TableName: tableName, Item: item, ConditionExpression: 'attribute_not_exists(id)' }));
    await sns.send(new SubscribeCommand({ TopicArn: topicArn, Protocol: 'email', Endpoint: item.correo }));
    return response(201, item);
  } catch (error) {
    console.error('Error creando usuario', error);
    return response(500, { message: 'No fue posible crear el usuario' });
  }
};
