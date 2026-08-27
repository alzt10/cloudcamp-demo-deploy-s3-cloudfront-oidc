// Capa de acceso a datos para Usuarios.
//
// Habla con el backend serverless (API Gateway + Lambda + DynamoDB) definido
// en backend/infrastructure.yaml. La URL base puede sobreescribirse con la
// variable de entorno VITE_API_URL (build time de Vite).

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://h3sj3fpljf.execute-api.us-east-1.amazonaws.com/Prod'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    const message = data?.message || `Error ${res.status}`
    throw new Error(message)
  }

  return data
}

function toPayload(data) {
  return {
    nombre: data.nombre.trim(),
    apellidos: data.apellidos.trim(),
    celular: data.celular.trim(),
    correo: data.correo.trim(),
  }
}

export async function getUsers() {
  const users = await request('/users')
  return [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createUser(data) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(toPayload(data)),
  })
}

export async function updateUser(id, data) {
  return request('/users', {
    method: 'PUT',
    body: JSON.stringify({ id, ...toPayload(data) }),
  })
}

export async function deleteUser(id) {
  return request('/users', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
}
