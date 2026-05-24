import { Truck, BellRing, ClipboardList, Wrench, Fuel, Map, Users } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import StatCard from '../components/ui/StatCard'
import AlertItem from '../components/ui/AlertItem'
import { formatDate, formatEuro, formatKm } from '../lib/utils'

function greet() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const { frota, alerts, pedidos, manutencoes, abastecimentos, viagens, condutores, currentUser } = useAppStore()

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical')
  const pendingPedidos = pedidos.filter((p) => p.estado === 'pendente' || p.estado === 'aberto')
  const totalMaintCost = manutencoes.reduce((s, m) => s + (Number(m.custo) || 0), 0)

  // This month fuel cost
  const thisMonth = new Date().toISOString().slice(0, 7)
  const fuelThisMonth = abastecimentos
    .filter((a) => a.data?.startsWith(thisMonth))
    .reduce((s, a) => s + (Number(a.custo_total) || 0), 0)

  // Km this month from viagens
  const kmThisMonth = viagens
    .filter((v) => v.data?.startsWith(thisMonth))
    .reduce((s, v) => s + (Number(v.km) || 0), 0)

  const activeDrivers = condutores.filter((c) => c.ativo !== false).length

  const upcomingAlerts = alerts.filter((a) => a.severity === 'warning').slice(0, 5)
  const recentMaintenance = [...manutencoes].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greet()}{currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-sm text-slate-500 mt-1 capitalize">{todayLabel()}</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Truck} value={frota.length} label="Viaturas na frota" color="green" />
        <StatCard
          icon={BellRing}
          value={criticalAlerts.length}
          label="Alertas críticos"
          color={criticalAlerts.length > 0 ? 'red' : 'green'}
        />
        <StatCard
          icon={ClipboardList}
          value={pendingPedidos.length}
          label="Pedidos pendentes"
          color={pendingPedidos.length > 0 ? 'amber' : 'green'}
        />
        <StatCard
          icon={Wrench}
          value={formatEuro(totalMaintCost)}
          label="Custo total manutenção"
          color="slate"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Fuel} value={formatEuro(fuelThisMonth)} label="Combustível este mês" color="blue" />
        <StatCard icon={Map} value={formatKm(kmThisMonth)} label="Km percorridos este mês" color="purple" />
        <StatCard icon={Users} value={activeDrivers} label="Condutores activos" color="green" />
      </div>

      {/* Alerts + Recent maintenance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Critical alerts */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Alertas críticos</h2>
            <span className="text-xs text-slate-500">{criticalAlerts.length} activo(s)</span>
          </div>
          <div className="p-4 space-y-2">
            {criticalAlerts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum alerta crítico</p>
            ) : (
              criticalAlerts.map((a) => <AlertItem key={a.id} alert={a} />)
            )}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Próximos prazos</h2>
            <span className="text-xs text-slate-500">{upcomingAlerts.length} pendente(s)</span>
          </div>
          <div className="p-4 space-y-2">
            {upcomingAlerts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum prazo próximo</p>
            ) : (
              upcomingAlerts.map((a) => <AlertItem key={a.id} alert={a} />)
            )}
          </div>
        </div>
      </div>

      {/* Recent maintenance */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Manutenções recentes</h2>
        </div>
        {recentMaintenance.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhuma manutenção registada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Viatura</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Custo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-slate-600">{formatDate(m.data)}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{m.matricula || m.viatura_id || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        m.tipo === 'preventiva' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {m.tipo === 'preventiva' ? 'Preventiva' : m.tipo === 'corretiva' ? 'Corretiva' : m.tipo || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{m.descricao || '—'}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">{formatEuro(m.custo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
