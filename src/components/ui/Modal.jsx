import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import useAppStore from '../../store/useAppStore'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const { isDark } = useAppStore()

  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
  }[size] || 'max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={clsx(
          'relative w-full rounded-xl shadow-xl max-h-[90vh] flex flex-col border',
          isDark
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-slate-200',
          sizeClass
        )}
      >
        {/* Header */}
        <div className={clsx(
          'flex items-center justify-between px-5 py-4 border-b',
          isDark ? 'border-slate-700' : 'border-slate-100'
        )}>
          <h3 className={clsx(
            'text-base font-semibold',
            isDark ? 'text-slate-100' : 'text-slate-900'
          )}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              isDark
                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            )}
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
