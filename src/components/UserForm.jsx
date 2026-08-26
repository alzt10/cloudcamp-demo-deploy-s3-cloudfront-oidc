import { useEffect, useState } from 'react'

const EMPTY_FORM = { nombre: '', apellidos: '', celular: '', correo: '' }

function validate(values) {
  const errors = {}
  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio'
  if (!values.apellidos.trim()) errors.apellidos = 'Los apellidos son obligatorios'
  if (!/^[0-9+\s-]{7,15}$/.test(values.celular.trim())) errors.celular = 'Celular inválido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo.trim())) errors.correo = 'Correo inválido'
  return errors
}

export default function UserForm({ editingUser, onSubmit, onCancelEdit }) {
  const [values, setValues] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setValues(editingUser ? { ...editingUser } : EMPTY_FORM)
    setErrors({})
  }, [editingUser])

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(values)
      if (!editingUser) setValues(EMPTY_FORM)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{editingUser ? 'Editar usuario' : 'Nuevo usuario'}</h2>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            value={values.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ana"
          />
          {errors.nombre && <span className="error">{errors.nombre}</span>}
        </div>

        <div className="field">
          <label htmlFor="apellidos">Apellidos</label>
          <input
            id="apellidos"
            value={values.apellidos}
            onChange={(e) => handleChange('apellidos', e.target.value)}
            placeholder="Gómez Ruiz"
          />
          {errors.apellidos && <span className="error">{errors.apellidos}</span>}
        </div>

        <div className="field">
          <label htmlFor="celular">Celular</label>
          <input
            id="celular"
            value={values.celular}
            onChange={(e) => handleChange('celular', e.target.value)}
            placeholder="+57 300 123 4567"
          />
          {errors.celular && <span className="error">{errors.celular}</span>}
        </div>

        <div className="field">
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            type="email"
            value={values.correo}
            onChange={(e) => handleChange('correo', e.target.value)}
            placeholder="ana@correo.com"
          />
          {errors.correo && <span className="error">{errors.correo}</span>}
        </div>
      </div>

      <div className="form-actions">
        {editingUser && (
          <button type="button" className="btn btn-ghost" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : editingUser ? 'Guardar cambios' : 'Agregar usuario'}
        </button>
      </div>
    </form>
  )
}
