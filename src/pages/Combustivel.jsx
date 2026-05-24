import { useState } from 'react'
import { Plus, Fuel, Trash2, AlertTriangle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'
import { formatDate, formatEuro, todayISO } from '../lib/utils'

const EMPTY = {
  matricula: '', data: todayISO(), litros: '', custo_total: '',
  km_no_abastecimento: '', posto: '', tipo_combustivel: 'gasóleo',
}

export default function Combustivel() {
  const { abastecimentos, frota, addAbastecimento, deleteAbastecimento, dbMissing, showToast } = useAppStore()
  const [filterVehicle, setFilterVehicle] = useState('todas')
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const isMissing = dbMissing.includes('abastecimentos')

  const thisMonth = new Date().toISOString().slice(0, 7)
  const fuelThisMonth = abastecimentos
    .filter((a) => a.data?.startsWith(thisMonth))
    .reduce((s, a) => s + (Number(a.custo_total) || 0), 0)
  const totalCost = abastecimentos.reduce((s, a) => s + (Number(a.custo_total) || 0), 0)
  const totalLitros = abastecimentos.reduce((s, a) => s + (Number(a.litros) || 0), 0)

  const filtered = filterVehicle === 'todas' ? abastecimentos : abastecimentos.filter((a) => a.matricula === filterVehicle)
  const vehicles = [...new Set(abastecimentos.map((a) => a.matricula).filter(Boolean))]

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addAbastecimento({
        ...form,
        litros: form.litros ? Number(form.litros) : null,
        custo_total: form.custo_total ? Number(form.custo_total) : null,
        km_no_abastecimento: form.km_no_abastecimento ? Number(form.km_no_abastecimento) : null,
      })
      showToast('Abastecimento registado')
      setShowAdd(false)
      setForm(EMPTY)
    } catch (err) {
      showToast(err.message || 'Erro ao registar abastecimento', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteAbastecimento(showDelete.id)
      showToast('Abastecimento removido')
      setShowDelete(null)
    } catch (err) {
      showToast('Erro ao remover', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isMissing) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-slate-900">Combustível</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Tabela não encontrada</p>
            <p className="text-sm text-amber-700 mt-1">
              A tabela <code className="font-mono bg-amber-100 px-1 rounded">abastecimentos</code> não existe na base de dados.
              Aceda a <strong>Configurações</strong> para executar a migração SQL.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Combustível</h1>
          <p className="text-sm text-slate-500">{abastecimentos.length} registo(s)</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Registar abastecimento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Fuel} value={formatEuro(fuelThisMonth)} label="Custo este mês" color="blue" />
        <StatCard icon={Fuel} value={formatEuro(totalCost)} label="Custo total" color="slate" />
        <StatCard icon={Fuel} value={`${totalLitros.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} L`} label="Total litros" color="green" />
      </div>

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilterVehicle('todas')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterVehicle === 'todas' ? 'bg-[#2d6a4f] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Todas
        </button>
        {vehicles.map((v) => (
          <button
            key={v}
            onClick={() => setFilterVehicle(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium font-mono transition-all ${filterVehicle === v ? 'bg-[#2d6a4f] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Fuel size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum abastecimento registado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Data', 'Viatura', 'Litros', 'Custo total', '€/L', 'Km', 'Posto', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((a) => {
                  const eurPerL = a.litros && a.custo_total ? (a.custo_total / a.litros).toFixed(3) : null
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-600">{formatDate(a.data)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">{a.matricula || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{a.litros ? `${Number(a.litros).toFixed(2)} L` : '—'}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatEuro(a.custo_total)}</td>
                      <td className="px-4 py-3 text-slate-600">{eurPerL ? `${eurPerL} €/L` : '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{a.km_no_abastecimento ? `${Number(a.km_no_abastecimento).toLocaleString('pt-PT')} km` : '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{a.posto || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setShowDelete(a)} className="p-1.5 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Registar abastecimento" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Viatura *</label>
              <select name="matricula" value={form.matricula} onChange={handleFormChange} className="input-field" required>
                <option value="">Seleccionar...</option>
                {frota.map((v) => <option key={v.id} value={v.matricula}>{v.matricula} — {v.marca} {v.modelo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
              <input name="data" value={form.data} onChange={handleFormChange} type="date" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Litros</label>
              <input name="litros" value={form.litros} onChange={handleFormChange} type="number" step="0.01" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custo total (€) *</label>
              <input name="custo_total" value={form.custo_total} onChange={handleFormChange} type="number" step="0.01" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Km no abastecimento</label>
              <input name="km_no_abastecimento" value={form.km_no_abastecimento} onChange={handleFormChange} type="number" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Posto</label>
              <input name="posto" value={form.posto} onChange={handleFormChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de combustível</label>
              <select name="tipo_combustivel" value={form.tipo_combustivel} onChange={handleFormChange} className="input-field">
                <option value="gasóleo">Gasóleo</option>
                <option value="gasolina">Gasolina</option>
                <option value="elétrico">Elétrico</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'A guardar...' : 'Registar'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Remover abastecimento" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Confirma a remoção deste abastecimento?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDelete(null)} className="flex-1 btn-secondary">Cancelar</button>
            <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
              {saving ? 'A remover...' : 'Remover'}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .input-field { width:100%;padding:.5rem .75rem;font-size:.875rem;border:1px solid #e2e8f0;border-radius:.5rem;outline:none;transition:box-shadow .15s;background:white;color:#0f172a; }
        .input-field:focus { box-shadow:0 0 0 2px #2d6a4f40;border-color:#2d6a4f; }
        .btn-primary { padding:.5rem 1rem;background:#2d6a4f;color:white;font-size:.875rem;font-weight:600;border-radius:.5rem;border:none;cursor:pointer;transition:background .15s; }
        .btn-primary:hover { background:#1b4332; }
        .btn-primary:disabled { opacity:.6;cursor:not-allowed; }
        .btn-secondary { padding:.5rem 1rem;background:white;color:#475569;font-size:.875rem;font-weight:600;border-radius:.5rem;border:1px solid #e2e8f0;cursor:pointer;transition:background .15s; }
        .btn-secondary:hover { background:#f8fafc; }
      `}</style>
    </div>
  )
}
