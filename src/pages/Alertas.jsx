import { useState } from 'react'
import { BellRing, CheckCircle, AlertTriangle, XCircle, Filter } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import AlertItem from '../components/ui/AlertItem'
import { formatDate } from '../lib/utils'

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'critical', label: 'Críticos' },
  { key: 'warning', label: 'Próximos' },
  { key: 'ok', label: 'OK' },
]

export default function Alertas() {
  const { alerts, frota, condutores } = useAppStore()
  const [activeTab, setActiveTab] = useState('todos')

  const filtered = alerts.filter((a) => {
    if (activeTab === 'todos') return true
    if (activeTab === 'ok') return a.severity === 'ok'
    return a.severity === activeTab
  })

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const warningCount = alerts.filter((a) => a.severity === 'warning').length
  const okVehicles = frota.filter((v) => {
    return !alerts.find((a) => a.viatura === v.matricula && a.severity === 'critical')
  })

  const sysLog = [
    `[${new Date().toISOString()}] Sistema de monitorização iniciado`,
    `[${new Date().toISOString()}] ${frota.length} viatura(s) em monitorização`,
    `[${new Date().toISOString()}] ${condutores.length} condutor(es) em monitorização`,
    `[${new Date().toISOString()}] ${criticalCount} alerta(s) crítico(s) detectado(s)`,
    `[${new Date().toISOString()}] ${warningCount} aviso(s) de atenção detectado(s)`,
    ...alerts.map((a) => `[${new Date().toISOString()}] [${a.severity.toUpperCase()}] ${a.message}`),
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Alertas</h1>
        <p className="text-sm text-slate-500">Monitorização automática da frota e condutores</p>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <XCircle size={20} className="text-red-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
          <div className="text-xs text-red-600">Críticos</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <AlertTriangle size={20} className="text-amber-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-amber-700">{warningCount}</div>
          <div className="text-xs text-amber-600">Atenção</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <CheckCircle size={20} className="text-emerald-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-emerald-700">{okVehicles.length}</div>
          <div className="text-xs text-emerald-600">Sem alertas críticos</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
            {tab.key !== 'todos' && tab.key !== 'ok' && (
              <span className="ml-1.5 text-xs opacity-70">
                {tab.key === 'critical' ? criticalCount : warningCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Lista de alertas</h2>
          <span className="text-xs text-slate-500">{filtered.length} resultado(s)</span>
        </div>
        <div className="p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <CheckCircle size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Nenhum alerta nesta categoria</p>
            </div>
          ) : (
            filtered.map((a) => <AlertItem key={a.id} alert={a} />)
          )}
        </div>
      </div>

      {/* System log */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="ml-2 text-xs text-slate-400 font-mono">log do sistema</span>
        </div>
        <div className="p-4 max-h-56 overflow-y-auto space-y-0.5">
          {sysLog.map((line, i) => (
            <div key={i} className="font-mono text-xs text-slate-300 leading-relaxed">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
