# CloudCamp · CRUD de Usuarios (DevOps 2026-2)

CRUD básico de usuarios (nombre, apellidos, celular, correo) hecho en React + Vite.
Por ahora persiste en `localStorage`; la capa `src/services/userService.js` está
aislada para que más adelante se reemplace fácilmente por llamadas a una API
serverless (API Gateway + Lambda, por ejemplo) sin tocar la UI.

## Uso

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto http://localhost:5173).

## Build de producción

```bash
npm run build
npm run preview
```

`dist/` queda listo para desplegar en cualquier hosting estático (S3 + CloudFront,
Netlify, Vercel, etc.) — ideal para la siguiente fase del curso.
