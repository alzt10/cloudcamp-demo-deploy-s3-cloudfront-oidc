# CloudCamp Users CRUD

Aplicacion basica en React para administrar usuarios. Los datos se guardan en `localStorage` para que el proyecto pueda evolucionar despues hacia un servicio externo serverless.

## Datos del usuario

- Nombre
- Apellidos
- Celular
- Correo electronico

## Ejecutar localmente

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Luego abre la URL que muestra Vite en la terminal.

## Funcionalidades

- Crear usuarios desde el formulario modal.
- Editar y eliminar registros.
- Buscar por nombre, apellido, celular o correo.
- Persistir los cambios automaticamente en el navegador.
- Datos de ejemplo para comenzar la demostracion.

La futura migracion serverless puede reemplazar las operaciones de estado en `src/App.jsx` por llamadas a una API sin modificar la interfaz.

# cloudcamp-demo-deploy-s3-cloudfront-oidc
