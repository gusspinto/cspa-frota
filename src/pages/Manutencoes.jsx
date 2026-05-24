import { useState } from 'react'
import { Plus, Wrench, Trash2 } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { formatDate, formatEuro, formatKm, todayISO } from '../lib/utils'

const EMPTY = {
  matricula: '', tipo: 'preventiva', descricao: '', data: todayISO(),
  custo: '', km_na_manutencao: '', oficina: '', notas: '',
}

export default function Manutencoes() {
  const { manutencoes, frota, addManutencao, deleteManutencao, showToast } = useAppStore()
  const [filterVehicle, setFilterVehicle] = useState('todas')
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const vehicles = [...new Set(manutencoes.map((m) => m.matricula).filter(Boolean))]
  const filtered = filterVehicle === 'todas' ? manutencoes : manutencoes.filter((m) => m.matricula === filterVehicle)

  // Cost per vehicle for bar chart
  const costByVehicle = frota.map((v) => {
    const total = manutencoes
      .filter((m) => m.matricula === v.matricula)
      .reduce((s, m) => s + (Number(m.custo) || 0), 0)
    return { matricula: v.matricula, total }
  }).filter((x) => x.total > 0)
  const maxCost = Math.max(...costByVehicle.map((x) => x.total), 1)

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addManutencao({
        ...form,
        custo: form.custo ? Number(form.custo) : null,
        km_na_manutencao: form.km_na_manutencao ? Number(form.km_na_manutencao) : null,
      })
      showToast('Manutenção registada')
      setShowAdd(false)
      setForm(EMPTY)
    } catch (err) {
      showToast(err.message || 'Erro ao registar manutenção', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteManutencao(showDelete.id)
      showToast('Manutenção removida')
      setShowDelete(null)
    } catch (err) {
      showToast(err.message || 'Erro ao remover', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manutenções</h1>
          <p className="text-sm text-slate-500">{manutencoes.length} registo(s)</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Registar manutenção
        </button>
      </div>

      {/* Cost chart */}
      {costByVehicle.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Custo por viatura</h2>
          <div className="space-y-3">
            {costByVehicle.sort((a, b) => b.total - a.total).map((item) => (
              <div key={item.matricula} className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-600 w-24 shrink-0">{item.matricula}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2d6a4f] rounded-full"
                    style={{ width: `${(item.total / maxCost) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700 w-24 text-right">{formatEuro(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilterVehicle('todas')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filterVehicle === 'todas' ? 'bg-[#2d6a4f] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todas
        </button>
        {vehicles.map((v) => (
          <button
            key={v}
            onClick={() => setFilterVehicle(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium font-mono transition-all ${
              filterVehicle === v ? 'bg-[#2d6a4f] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Wrench size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhuma manutenção registada</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((m) => (
              <div key={m.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50">
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    m.tipo === 'preventiva' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-slate-900 text-sm">{m.matricula || '—'}</span>
                    <Badge variant={m.tipo === 'preventiva' ? 'info' : 'warning'}>
                      {m.tipo === 'preventiva' ? 'Preventiva' : m.tipo === 'corretiva' ? 'Corretiva' : m.tipo}
                    </Badge>
                    <span className="text-xs text-slate-400">{formatDate(m.data)}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{m.descricao || '—'}</p>
                  {m.oficina && <p className="text-xs text-slate-400 mt-0.5">Oficina: {m.oficina}</p>}
                  {m.km_na_manutencao && <p className="text-xs text-slate-400">Km: {formatKm(m.km_na_manutencao)}</p>}
                  {m.notas && <p className="text-xs text-slate-500 mt-1 italic">{m.notas}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {m.custo != null && (
                    <span className="text-sm font-semibold text-slate-900">{formatEuro(m.custo)}</span>
                  )}
                  <button
                    onClick={() => setShowDelete(m)}
                    className="p-1.5 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Registar manutenção" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Viatura *</label>
              <select name="matricula" value={form.matricula} onChange={handleFormChange} className="input-field" required>
                <option value="">Seleccionar...</option>
                {frota.map((v) => (
                  <option key={v.id} value={v.matricula}>{v.matricula} — {v.marca} {v.modelo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleFormChange} className="input-field">
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
              <input name="data" value={form.data} onChange={handleFormChange} type="date" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custo (€)</label>
              <input name="custo" value={form.custo} onChange={handleFormChange} type="number" step="0.01" className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Km na manutenção</label>
              <input name="km_na_manutencao" value={form.km_na_manutencao} onChange={handleFormChange} type="number" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Oficina</label>
              <input name="oficina" value={form.oficina} onChange={handleFormChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
            <input name="descricao" value={form.descricao} onChange={handleFormChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea name="notas" value={form.notas} onChange={handleFormChange} className="input-field resize-none" rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'A guardar...' : 'Registar'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Remover manutenção" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Confirma a remoção deste registo de manutenção?</p>
          <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">{showDelete?.descricao}</p>
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
