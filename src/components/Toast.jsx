import { useEffect } from 'react'

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return <div className="toast">{message}</div>
}
