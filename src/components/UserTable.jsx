function initials(nombre, apellidos) {
  return `${nombre[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase()
}

export default function UserTable({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="card empty-state">
        <p>Cargando usuarios…</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="card empty-state">
        <span className="empty-emoji">🗂️</span>
        <p>Aún no hay usuarios registrados.</p>
        <p className="muted">Usa el formulario para agregar el primero.</p>
      </div>
    )
  }

  return (
    <div className="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Celular</th>
            <th>Correo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="avatar">{initials(user.nombre, user.apellidos)}</div>
              </td>
              <td>{user.nombre}</td>
              <td>{user.apellidos}</td>
              <td>{user.celular}</td>
              <td>{user.correo}</td>
              <td className="row-actions">
                <button className="icon-btn" title="Editar" onClick={() => onEdit(user)}>
                  ✏️
                </button>
                <button className="icon-btn danger" title="Eliminar" onClick={() => onDelete(user)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
