import { useEffect, useMemo, useState } from 'react'
import UserForm from './components/UserForm.jsx'
import UserTable from './components/UserTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import Toast from './components/Toast.jsx'
import { getUsers, createUser, updateUser, deleteUser } from './services/userService.js'

export default function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      `${u.nombre} ${u.apellidos} ${u.celular} ${u.correo}`.toLowerCase().includes(q),
    )
  }, [users, search])

  async function handleSubmit(values) {
    if (editingUser) {
      const updated = await updateUser(editingUser.id, values)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setEditingUser(null)
      setToast('Usuario actualizado ✔')
    } else {
      const created = await createUser(values)
      setUsers((prev) => [created, ...prev])
      setToast('Usuario agregado ✔')
    }
  }

  async function handleConfirmDelete() {
    await deleteUser(userToDelete.id)
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
    if (editingUser?.id === userToDelete.id) setEditingUser(null)
    setToast('Usuario eliminado')
    setUserToDelete(null)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-logo">☁️</span>
          <div>
            <h1>CloudCamp · Usuarios</h1>
            <p className="muted">DevOps 2026-2 — CRUD con React + localStorage</p>
          </div>
        </div>
        <span className="badge">{users.length} usuario{users.length === 1 ? '' : 's'}</span>
      </header>

      <main className="app-main">
        <UserForm
          editingUser={editingUser}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingUser(null)}
        />

        <section className="list-section">
          <div className="list-header">
            <h2>Usuarios registrados</h2>
            <input
              className="search"
              placeholder="Buscar por nombre, celular o correo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <UserTable
            users={filteredUsers}
            loading={loading}
            onEdit={setEditingUser}
            onDelete={setUserToDelete}
          />
        </section>
      </main>

      <footer className="app-footer muted">
        Datos guardados en <code>localStorage</code> del navegador — próximamente en un backend serverless ⚡
      </footer>

      <ConfirmDialog
        user={userToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
