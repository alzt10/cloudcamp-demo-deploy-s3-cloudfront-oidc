const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const ses = new SESClient({});
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
exports.handler = async event => {
  for (const record of event.Records || []) {
    const user = JSON.parse(record.body);
    const name = `${escapeHtml(user.nombre)} ${escapeHtml(user.apellidos)}`.trim();
    const html = `<html><body><h1>Usuario eliminado</h1><p>Se elimino el usuario <strong>${name}</strong>.</p><ul><li>Correo: ${escapeHtml(user.correo)}</li><li>Celular: ${escapeHtml(user.celular)}</li><li>ID: ${escapeHtml(user.id)}</li></ul></body></html>`;
    await ses.send(new SendEmailCommand({ Source: process.env.SENDER_EMAIL, Destination: { ToAddresses: [process.env.ADMIN_EMAIL] }, Message: { Subject: { Data: 'Usuario eliminado' }, Body: { Html: { Data: html, Charset: 'UTF-8' }, Text: { Data: `Usuario eliminado: ${name}`, Charset: 'UTF-8' } } } }));
  }
};
