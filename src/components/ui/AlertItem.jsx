import clsx from 'clsx'
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react'

export default function AlertItem({ alert }) {
  const isCritical = alert.severity === 'critical'
  const isWarning = alert.severity === 'warning'

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-3 rounded-lg border',
        isCritical && 'bg-red-50 border-red-200',
        isWarning && 'bg-amber-50 border-amber-200',
        !isCritical && !isWarning && 'bg-emerald-50 border-emerald-200'
      )}
    >
      <div className="mt-0.5">
        {isCritical && <XCircle size={16} className="text-red-600" />}
        {isWarning && <AlertTriangle size={16} className="text-amber-600" />}
        {!isCritical && !isWarning && <CheckCircle size={16} className="text-emerald-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            'text-sm font-medium',
            isCritical && 'text-red-800',
            isWarning && 'text-amber-800',
            !isCritical && !isWarning && 'text-emerald-800'
          )}
        >
          {alert.message}
        </p>
        {alert.date && (
          <p className="text-xs text-slate-500 mt-0.5">
            Data: {new Date(alert.date).toLocaleDateString('pt-PT')}
          </p>
        )}
      </div>
    </div>
  )
}
