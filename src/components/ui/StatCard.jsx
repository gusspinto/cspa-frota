import clsx from 'clsx'
import useAppStore from '../../store/useAppStore'

export default function StatCard({ icon: Icon, value, label, trend, trendLabel, color = 'green', className }) {
  const { isDark } = useAppStore()

  const colorMap = {
    green:  { icon: isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-50 text-[#2d6a4f]',  border: 'border-l-4 border-l-[#2d6a4f]' },
    red:    { icon: isDark ? 'bg-red-900/50 text-red-400'         : 'bg-red-50 text-red-600',          border: 'border-l-4 border-l-red-500' },
    amber:  { icon: isDark ? 'bg-amber-900/50 text-amber-400'     : 'bg-amber-50 text-amber-600',      border: 'border-l-4 border-l-amber-500' },
    blue:   { icon: isDark ? 'bg-blue-900/50 text-blue-400'       : 'bg-blue-50 text-blue-600',        border: 'border-l-4 border-l-blue-500' },
    purple: { icon: isDark ? 'bg-purple-900/50 text-purple-400'   : 'bg-purple-50 text-purple-600',    border: 'border-l-4 border-l-purple-500' },
    slate:  { icon: isDark ? 'bg-slate-700 text-slate-400'        : 'bg-slate-100 text-slate-600',     border: 'border-l-4 border-l-slate-400' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <div
      className={clsx(
        'rounded-lg border shadow-sm p-5 flex items-start gap-4',
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
        c.border,
        className
      )}
    >
      {Icon && (
        <div className={clsx('p-2.5 rounded-lg', c.icon)}>
          <Icon size={20} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={clsx(
          'text-2xl font-bold leading-tight',
          isDark ? 'text-slate-100' : 'text-slate-900'
        )}>
          {value}
        </div>
        <div className={clsx(
          'text-sm mt-0.5',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          {label}
        </div>
        {trend != null && (
          <div className={clsx(
            'text-xs mt-1.5 font-medium',
            trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-slate-400'
          )}>
            {trend > 0 ? '+' : ''}{trend}% {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
}
