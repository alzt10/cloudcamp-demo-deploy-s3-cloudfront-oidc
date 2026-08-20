const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});

const TABLE_NAME = process.env.USERSTABLE_TABLE_NAME;
const TOPIC_ARN = process.env.USERSTOPIC_TOPIC_ARN;
const UPDATE_NOTIFICATION_MESSAGE = 'Se libran el dia de hoy del profe Alejo';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;
const UPDATABLE_FIELDS = ['nombre', 'apellidos', 'celular', 'correo'];

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

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!id) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'id es requerido' }) };
  }

  const expressionNames = {};
  const expressionValues = {};
  const setClauses = [];

  for (const field of UPDATABLE_FIELDS) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') continue;

    const value = field === 'correo' ? body[field].trim().toLowerCase() : body[field].trim();

    if (field === 'correo' && !EMAIL_REGEX.test(value)) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'correo no es valido' }) };
    }
    if (field === 'celular' && !PHONE_REGEX.test(value)) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'celular no es valido' }) };
    }

    expressionNames[`#${field}`] = field;
    expressionValues[`:${field}`] = value;
    setClauses.push(`#${field} = :${field}`);
  }

  if (setClauses.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'No hay campos validos para actualizar' }) };
  }

  expressionNames['#updatedAt'] = 'updatedAt';
  expressionValues[':updatedAt'] = new Date().toISOString();
  setClauses.push('#updatedAt = :updatedAt');

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${setClauses.join(', ')}`,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW',
      })
    );

    try {
      await sns.send(
        new PublishCommand({
          TopicArn: TOPIC_ARN,
          Message: UPDATE_NOTIFICATION_MESSAGE,
        })
      );
    } catch (err) {
      console.error('Error publicando notificacion de actualizacion', err);
    }

    return { statusCode: 200, headers, body: JSON.stringify(result.Attributes) };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 404, headers, body: JSON.stringify({ message: 'Usuario no encontrado' }) };
    }
    console.error('Error actualizando usuario', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'No se pudo actualizar el usuario' }) };
  }
};
