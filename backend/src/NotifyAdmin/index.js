const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml(user) {
  return `<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Usuario eliminado</h2>
    <p>Se ha eliminado el siguiente usuario del sistema:</p>
    <table cellpadding="6" style="border-collapse: collapse;">
      <tr><td><strong>ID</strong></td><td>${escapeHtml(user.id)}</td></tr>
      <tr><td><strong>Nombre</strong></td><td>${escapeHtml(user.nombre)}</td></tr>
      <tr><td><strong>Apellidos</strong></td><td>${escapeHtml(user.apellidos)}</td></tr>
      <tr><td><strong>Celular</strong></td><td>${escapeHtml(user.celular)}</td></tr>
      <tr><td><strong>Correo</strong></td><td>${escapeHtml(user.correo)}</td></tr>
    </table>
  </body>
</html>`;
}

exports.handler = async event => {
  console.log(JSON.stringify(event, undefined, 2));

  for (const record of event.Records || []) {
    let user;
    try {
      user = JSON.parse(record.body);
    } catch (err) {
      console.error('Mensaje SQS con cuerpo invalido, se descarta', record.body);
      continue;
    }

    await ses.send(
      new SendEmailCommand({
        Source: SENDER_EMAIL,
        Destination: { ToAddresses: [ADMIN_EMAIL] },
        Message: {
          Subject: { Data: `Usuario eliminado: ${user.nombre || ''} ${user.apellidos || ''}`.trim() },
          Body: { Html: { Data: buildHtml(user) } },
        },
      })
    );
  }

  return {};
};
