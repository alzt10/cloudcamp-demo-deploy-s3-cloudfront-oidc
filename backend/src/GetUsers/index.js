const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.USERSTABLE_TABLE_NAME;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async event => {
  console.log(JSON.stringify(event, undefined, 2));

  try {
    const items = [];
    let ExclusiveStartKey;
    do {
      const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME, ExclusiveStartKey }));
      items.push(...(result.Items || []));
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return { statusCode: 200, headers, body: JSON.stringify(items) };
  } catch (err) {
    console.error('Error listando usuarios', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'No se pudo listar los usuarios' }) };
  }
};
