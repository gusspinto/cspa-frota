import { useState } from 'react'
import { Plus, Users, Trash2, AlertTriangle, Phone, Mail } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { formatDate, daysUntil, todayISO } from '../lib/utils'

const EMPTY = {
  nome: '', numero_carta: '', carta_validade: '', telefone: '',
  email: '', notas: '', ativo: true,
}

function licenseBadge(validade) {
  if (!validade) return <Badge variant="gray">—</Badge>
  const days = daysUntil(validade)
  if (days == null) return <Badge variant="gray">—</Badge>
  if (days <= 0) return <Badge variant="critical">Expirada</Badge>
  if (days <= 60) return <Badge variant="warning">{days}d restantes</Badge>
  return <Badge variant="ok">Válida</Badge>
}

export default function Condutores() {
  const { condutores, addCondutor, deleteCondutor, dbMissing, showToast } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const isMissing = dbMissing.includes('condutores')
  const expiring = condutores.filter((c) => {
    const d = daysUntil(c.carta_validade)
    return d != null && d <= 60
  })

  function handleFormChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [e.target.name]: val }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addCondutor(form)
      showToast('Condutor adicionado')
      setShowAdd(false)
      setForm(EMPTY)
    } catch (err) {
      showToast(err.message || 'Erro ao adicionar condutor', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteCondutor(showDelete.id)
      showToast('Condutor removido')
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
        <h1 className="text-xl font-bold text-slate-900">Condutores</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Tabela não encontrada</p>
            <p className="text-sm text-amber-700 mt-1">
              A tabela <code className="font-mono bg-amber-100 px-1 rounded">condutores</code> não existe na base de dados.
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
          <h1 className="text-xl font-bold text-slate-900">Condutores</h1>
          <p className="text-sm text-slate-500">{condutores.length} condutor(es) registado(s)</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Adicionar condutor
        </button>
      </div>

      {/* Expiry alerts */}
      {expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
            <AlertTriangle size={15} />
            {expiring.length} carta(s) a expirar em breve
          </div>
          {expiring.map((c) => (
            <div key={c.id} className="text-sm text-amber-700">
              <strong>{c.nome}</strong> — Carta expira em {daysUntil(c.carta_validade)} dia(s) ({formatDate(c.carta_validade)})
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {condutores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum condutor registado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Nome', 'N.º Carta', 'Validade carta', 'Telefone', 'Email', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {condutores.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{c.nome}</div>
                      {c.notas && <div className="text-xs text-slate-400 truncate max-w-xs">{c.notas}</div>}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{c.numero_carta || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {licenseBadge(c.carta_validade)}
                        {c.carta_validade && (
                          <span className="text-xs text-slate-400">{formatDate(c.carta_validade)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.telefone ? (
                        <a href={`tel:${c.telefone}`} className="flex items-center gap-1.5 text-slate-600 hover:text-[#2d6a4f]">
                          <Phone size={12} />
                          {c.telefone}
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-slate-600 hover:text-[#2d6a4f] truncate max-w-[160px]">
                          <Mail size={12} />
                          {c.email}
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.ativo !== false ? (
                        <Badge variant="ok">Activo</Badge>
                      ) : (
                        <Badge variant="gray">Inactivo</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setShowDelete(c)}
                        className="p-1.5 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Adicionar condutor" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleFormChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">N.º Carta de condução</label>
              <input name="numero_carta" value={form.numero_carta} onChange={handleFormChange} className="input-field font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Validade da carta</label>
              <input name="carta_validade" value={form.carta_validade} onChange={handleFormChange} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleFormChange} type="tel" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleFormChange} type="email" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea name="notas" value={form.notas} onChange={handleFormChange} className="input-field resize-none" rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="ativo" id="ativo" checked={form.ativo} onChange={handleFormChange} className="rounded" />
            <label htmlFor="ativo" className="text-sm text-slate-700">Condutor activo</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'A guardar...' : 'Adicionar'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Remover condutor" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Confirma a remoção do condutor <strong>{showDelete?.nome}</strong>?
          </p>
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
