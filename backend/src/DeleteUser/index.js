const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sqs = new SQSClient({});

const TABLE_NAME = process.env.USERSTABLE_TABLE_NAME;
const QUEUE_URL = process.env.DELETEUSERSQUEUE_QUEUE_URL;
const DELETE_NOTIFICATION_DELAY_SECONDS = 3 * 60;

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

  let deletedUser;
  try {
    const result = await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_OLD',
      })
    );
    deletedUser = result.Attributes;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 404, headers, body: JSON.stringify({ message: 'Usuario no encontrado' }) };
    }
    console.error('Error eliminando usuario', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'No se pudo eliminar el usuario' }) };
  }

  try {
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(deletedUser),
        DelaySeconds: DELETE_NOTIFICATION_DELAY_SECONDS,
      })
    );
  } catch (err) {
    console.error('Error enviando mensaje a la cola de eliminacion', err);
  }

  return { statusCode: 200, headers, body: JSON.stringify(deletedUser) };
};
