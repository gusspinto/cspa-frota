import { useState } from 'react'
import { Plus, Gauge, Pencil, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { formatDate, formatKm, todayISO, daysUntil } from '../lib/utils'

function KmBar({ atual, proxima }) {
  if (!proxima || !atual) return null
  const pct = Math.min(100, Math.round((atual / proxima) * 100))
  let color = 'bg-emerald-500'
  if (pct >= 95) color = 'bg-red-500'
  else if (pct >= 80) color = 'bg-amber-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

function statusBadge(v) {
  const insuranceDays = daysUntil(v.seguro_validade)
  const inspecaoDays = daysUntil(v.inspecao_validade)
  const kmRemaining = v.km_proxima_revisao != null && v.km_atual != null ? v.km_proxima_revisao - v.km_atual : Infinity
  const isCritical =
    (insuranceDays != null && insuranceDays <= 0) ||
    (inspecaoDays != null && inspecaoDays <= 0) ||
    kmRemaining <= 0
  const isWarn =
    (insuranceDays != null && insuranceDays <= 30 && insuranceDays > 0) ||
    (inspecaoDays != null && inspecaoDays <= 45 && inspecaoDays > 0) ||
    (kmRemaining <= 1500 && kmRemaining > 0)

  if (isCritical) return <Badge variant="critical">Crítico</Badge>
  if (isWarn) return <Badge variant="warning">Atenção</Badge>
  return <Badge variant="ok">OK</Badge>
}

const EMPTY = {
  matricula: '', modelo: '', marca: '', ano: '', km_atual: '',
  km_proxima_revisao: '', seguro_validade: '', inspecao_validade: '',
  revisao_validade: '', combustivel: 'gasóleo', notas: '',
}

export default function Frota() {
  const { frota, addViatura, updateViatura, deleteViatura, showToast } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)
  const [showKm, setShowKm] = useState(null) // viatura object
  const [showDelete, setShowDelete] = useState(null) // viatura object
  const [form, setForm] = useState(EMPTY)
  const [kmValue, setKmValue] = useState('')
  const [saving, setSaving] = useState(false)

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addViatura({
        ...form,
        km_atual: form.km_atual ? Number(form.km_atual) : null,
        km_proxima_revisao: form.km_proxima_revisao ? Number(form.km_proxima_revisao) : null,
        ano: form.ano ? Number(form.ano) : null,
      })
      showToast('Viatura adicionada com sucesso')
      setShowAdd(false)
      setForm(EMPTY)
    } catch (err) {
      showToast(err.message || 'Erro ao adicionar viatura', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateKm(e) {
    e.preventDefault()
    if (!showKm) return
    setSaving(true)
    try {
      await updateViatura(showKm.id, { km_atual: Number(kmValue) })
      showToast('Km actualizados')
      setShowKm(null)
      setKmValue('')
    } catch (err) {
      showToast(err.message || 'Erro ao actualizar km', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!showDelete) return
    setSaving(true)
    try {
      await deleteViatura(showDelete.id)
      showToast('Viatura removida')
      setShowDelete(null)
    } catch (err) {
      showToast(err.message || 'Erro ao remover viatura', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Frota</h1>
          <p className="text-sm text-slate-500">{frota.length} viatura(s) registada(s)</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nova viatura
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {frota.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Truck size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhuma viatura registada</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 text-sm text-[#2d6a4f] hover:underline font-medium"
            >
              Adicionar primeira viatura
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Matrícula', 'Modelo', 'Km actuais', 'Próx. revisão (km)', 'Seguro', 'Inspeção', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {frota.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-slate-900">{v.matricula}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-medium">{v.marca} {v.modelo}</div>
                      {v.ano && <div className="text-xs text-slate-400">{v.ano}</div>}
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="text-slate-900 font-medium">{formatKm(v.km_atual)}</div>
                      <KmBar atual={v.km_atual} proxima={v.km_proxima_revisao} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatKm(v.km_proxima_revisao)}</td>
                    <td className="px-4 py-3">
                      {v.seguro_validade ? (
                        <div>
                          <div className="text-slate-600">{formatDate(v.seguro_validade)}</div>
                          {daysUntil(v.seguro_validade) != null && daysUntil(v.seguro_validade) <= 30 && (
                            <div className="text-xs text-amber-600">
                              {daysUntil(v.seguro_validade) <= 0
                                ? 'Expirado'
                                : `${daysUntil(v.seguro_validade)}d restantes`}
                            </div>
                          )}
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {v.inspecao_validade ? (
                        <div>
                          <div className="text-slate-600">{formatDate(v.inspecao_validade)}</div>
                          {daysUntil(v.inspecao_validade) != null && daysUntil(v.inspecao_validade) <= 45 && (
                            <div className="text-xs text-amber-600">
                              {daysUntil(v.inspecao_validade) <= 0
                                ? 'Expirada'
                                : `${daysUntil(v.inspecao_validade)}d restantes`}
                            </div>
                          )}
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">{statusBadge(v)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setShowKm(v); setKmValue(v.km_atual || '') }}
                          className="p-1.5 rounded text-slate-400 hover:text-[#2d6a4f] hover:bg-emerald-50 transition-colors"
                          title="Actualizar km"
                        >
                          <Gauge size={15} />
                        </button>
                        <button
                          onClick={() => setShowDelete(v)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Adicionar viatura" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula *</label>
              <input name="matricula" value={form.matricula} onChange={handleFormChange}
                className="input-field" placeholder="AA-00-BB" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Combustível</label>
              <select name="combustivel" value={form.combustivel} onChange={handleFormChange} className="input-field">
                <option value="gasóleo">Gasóleo</option>
                <option value="gasolina">Gasolina</option>
                <option value="elétrico">Elétrico</option>
                <option value="híbrido">Híbrido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
              <input name="marca" value={form.marca} onChange={handleFormChange} className="input-field" placeholder="Renault" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
              <input name="modelo" value={form.modelo} onChange={handleFormChange} className="input-field" placeholder="Trafic" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ano</label>
              <input name="ano" value={form.ano} onChange={handleFormChange} type="number" className="input-field" placeholder="2020" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Km actuais</label>
              <input name="km_atual" value={form.km_atual} onChange={handleFormChange} type="number" className="input-field" placeholder="85000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Km próx. revisão</label>
              <input name="km_proxima_revisao" value={form.km_proxima_revisao} onChange={handleFormChange} type="number" className="input-field" placeholder="90000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Validade seguro</label>
              <input name="seguro_validade" value={form.seguro_validade} onChange={handleFormChange} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Validade inspeção</label>
              <input name="inspecao_validade" value={form.inspecao_validade} onChange={handleFormChange} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data próx. revisão</label>
              <input name="revisao_validade" value={form.revisao_validade} onChange={handleFormChange} type="date" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea name="notas" value={form.notas} onChange={handleFormChange}
              className="input-field resize-none" rows={2} placeholder="Observações..." />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'A guardar...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update km modal */}
      <Modal open={!!showKm} onClose={() => setShowKm(null)} title={`Actualizar km — ${showKm?.matricula}`} size="sm">
        <form onSubmit={handleUpdateKm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Km actuais</label>
            <input
              type="number"
              value={kmValue}
              onChange={(e) => setKmValue(e.target.value)}
              className="input-field"
              placeholder="Introduzir km"
              min={showKm?.km_atual || 0}
              autoFocus
              required
            />
            {showKm?.km_atual && (
              <p className="text-xs text-slate-400 mt-1">Anterior: {formatKm(showKm.km_atual)}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowKm(null)} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'A guardar...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Remover viatura" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Tem a certeza que pretende remover a viatura{' '}
            <strong>{showDelete?.matricula} — {showDelete?.marca} {showDelete?.modelo}</strong>?
          </p>
          <p className="text-xs text-slate-500">Esta acção não pode ser desfeita.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDelete(null)} className="flex-1 btn-secondary">Cancelar</button>
            <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-60">
              {saving ? 'A remover...' : 'Remover'}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          outline: none;
          transition: box-shadow 0.15s;
          background: white;
          color: #0f172a;
        }
        .input-field:focus {
          box-shadow: 0 0 0 2px #2d6a4f40;
          border-color: #2d6a4f;
        }
        .btn-primary {
          padding: 0.5rem 1rem;
          background: #2d6a4f;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #1b4332; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary {
          padding: 0.5rem 1rem;
          background: white;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-secondary:hover { background: #f8fafc; }
      `}</style>
    </div>
  )
}
