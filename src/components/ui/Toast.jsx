import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

export default function Toast({ message, type = 'success' }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3200)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  const config = {
    success: { icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon_color: 'text-emerald-600' },
    error: { icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon_color: 'text-red-600' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon_color: 'text-amber-600' },
    info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon_color: 'text-blue-600' },
  }

  const c = config[type] || config.success
  const Icon = c.icon

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2">
      <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg', c.bg)}>
        <Icon size={16} className={c.icon_color} />
        <span className={clsx('text-sm font-medium', c.text)}>{message}</span>
        <button onClick={() => setVisible(false)} className="ml-2 opacity-60 hover:opacity-100">
          <X size={14} className={c.text} />
        </button>
      </div>
    </div>
  )
}
