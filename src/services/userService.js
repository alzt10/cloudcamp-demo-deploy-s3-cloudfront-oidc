// Capa de acceso a datos para Usuarios.
//
// Hoy persiste en localStorage. Cuando evolucionemos a un backend serverless
// (API Gateway + Lambda, por ejemplo), esta es la ÚNICA pieza que debe cambiar:
// las funciones mantienen la misma firma (reciben/devuelven Promesas), solo
// habría que reemplazar el cuerpo por `fetch('https://...')`.

const STORAGE_KEY = 'cloudcamp.usuarios'
const SIMULATED_LATENCY_MS = 150

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeAll(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS))
}

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function getUsers() {
  return delay(readAll().sort((a, b) => b.createdAt - a.createdAt))
}

export async function createUser(data) {
  const users = readAll()
  const user = {
    id: newId(),
    nombre: data.nombre.trim(),
    apellidos: data.apellidos.trim(),
    celular: data.celular.trim(),
    correo: data.correo.trim(),
    createdAt: Date.now(),
  }
  users.push(user)
  writeAll(users)
  return delay(user)
}

export async function updateUser(id, data) {
  const users = readAll()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('Usuario no encontrado')
  users[idx] = {
    ...users[idx],
    nombre: data.nombre.trim(),
    apellidos: data.apellidos.trim(),
    celular: data.celular.trim(),
    correo: data.correo.trim(),
  }
  writeAll(users)
  return delay(users[idx])
}

export async function deleteUser(id) {
  const users = readAll().filter((u) => u.id !== id)
  writeAll(users)
  return delay(true)
}
