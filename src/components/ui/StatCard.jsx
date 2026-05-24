import clsx from 'clsx'

export default function StatCard({ icon: Icon, value, label, trend, trendLabel, color = 'green', className }) {
  const colorMap = {
    green: { icon: 'bg-emerald-50 text-[#2d6a4f]', border: 'border-l-4 border-l-[#2d6a4f]' },
    red: { icon: 'bg-red-50 text-red-600', border: 'border-l-4 border-l-red-500' },
    amber: { icon: 'bg-amber-50 text-amber-600', border: 'border-l-4 border-l-amber-500' },
    blue: { icon: 'bg-blue-50 text-blue-600', border: 'border-l-4 border-l-blue-500' },
    purple: { icon: 'bg-purple-50 text-purple-600', border: 'border-l-4 border-l-purple-500' },
    slate: { icon: 'bg-slate-100 text-slate-600', border: 'border-l-4 border-l-slate-400' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex items-start gap-4',
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
        <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
        {trend != null && (
          <div
            className={clsx(
              'text-xs mt-1.5 font-medium',
              trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-slate-400'
            )}
          >
            {trend > 0 ? '+' : ''}{trend}% {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
}
