# CloudCamp · CRUD de Usuarios (DevOps 2026-2)

CRUD básico de usuarios (nombre, apellidos, celular, correo) hecho en React + Vite.
Por ahora persiste en `localStorage`; la capa `src/services/userService.js` está
aislada para que más adelante se reemplace fácilmente por llamadas a una API
serverless (API Gateway + Lambda, por ejemplo) sin tocar la UI.

## Datos del usuario

- Nombre
- Apellidos
- Celular
- Correo electrónico

## Uso

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto http://localhost:5173).

## Funcionalidades

- Crear usuarios desde el formulario modal.
- Editar y eliminar registros.
- Buscar por nombre, apellido, celular o correo.
- Persistir los cambios automaticamente en el navegador.
- Datos de ejemplo para comenzar la demostracion.

La futura migracion serverless puede reemplazar las operaciones de estado en `src/App.jsx` por llamadas a una API sin modificar la interfaz.

## Build de producción

```bash
npm run build
npm run preview
```

`dist/` queda listo para desplegar en cualquier hosting estático (S3 + CloudFront,
Netlify, Vercel, etc.) — ideal para la siguiente fase del curso.
