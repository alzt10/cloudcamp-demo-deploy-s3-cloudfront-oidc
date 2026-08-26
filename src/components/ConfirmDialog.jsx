export default function ConfirmDialog({ user, onConfirm, onCancel }) {
  if (!user) return null

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <h3>¿Eliminar usuario?</h3>
        <p>
          Esta acción eliminará a <strong>{user.nombre} {user.apellidos}</strong> del almacenamiento local.
        </p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
