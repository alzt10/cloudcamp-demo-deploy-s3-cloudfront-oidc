const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const response = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
exports.handler = async () => {
  try {
    const result = await db.send(new ScanCommand({ TableName: process.env.USERSTABLE_TABLE_NAME }));
    return response(200, result.Items || []);
  } catch (error) { console.error('Error listando usuarios', error); return response(500, { message: 'No fue posible obtener los usuarios' }); }
};
