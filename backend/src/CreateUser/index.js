const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, SubscribeCommand } = require('@aws-sdk/client-sns');
const crypto = require('crypto');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});

const TABLE_NAME = process.env.USERSTABLE_TABLE_NAME;
const TOPIC_ARN = process.env.USERSTOPIC_TOPIC_ARN;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async event => {
  console.log(JSON.stringify(event, undefined, 2));

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Cuerpo JSON invalido' }) };
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const apellidos = typeof body.apellidos === 'string' ? body.apellidos.trim() : '';
  const celular = typeof body.celular === 'string' ? body.celular.trim() : '';
  const correo = typeof body.correo === 'string' ? body.correo.trim().toLowerCase() : '';

  const errors = [];
  if (!nombre) errors.push('nombre es requerido');
  if (!apellidos) errors.push('apellidos es requerido');
  if (!celular) errors.push('celular es requerido');
  else if (!PHONE_REGEX.test(celular)) errors.push('celular no es valido');
  if (!correo) errors.push('correo es requerido');
  else if (!EMAIL_REGEX.test(correo)) errors.push('correo no es valido');

  if (errors.length > 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Error de validacion', errors }) };
  }

  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    nombre,
    apellidos,
    celular,
    correo,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: user,
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );
  } catch (err) {
    console.error('Error creando usuario', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'No se pudo crear el usuario' }) };
  }

  try {
    await sns.send(
      new SubscribeCommand({
        TopicArn: TOPIC_ARN,
        Protocol: 'email',
        Endpoint: correo,
      })
    );
  } catch (err) {
    console.error('Error suscribiendo usuario al topico SNS', err);
  }

  return { statusCode: 201, headers, body: JSON.stringify(user) };
};
