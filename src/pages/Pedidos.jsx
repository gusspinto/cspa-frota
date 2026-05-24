import { useState } from 'react'
import { Plus, ClipboardList, CheckCircle, XCircle, Clock, Loader2, Mail, Copy } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { formatDate, todayISO } from '../lib/utils'

const URGENCY_COLOR = {
  alta: 'border-l-red-500 bg-red-50',
  media: 'border-l-amber-500 bg-amber-50',
  baixa: 'border-l-slate-400 bg-slate-50',
}

const URGENCY_BADGE = {
  alta: 'critical',
  media: 'warning',
  baixa: 'gray',
}

const EMPTY = {
  titulo: '', descricao: '', matricula: '', urgencia: 'media',
  data: todayISO(), solicitante: '', estado: 'pendente',
}

export default function Pedidos() {
  const { pedidos, frota, addPedido, updatePedido, deletePedido, showToast } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)
  const [showEmail, setShowEmail] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [emailContent, setEmailContent] = useState('')

  const pending = pedidos.filter((p) => p.estado === 'pendente' || p.estado === 'aberto')
  const resolved = pedidos.filter((p) => p.estado === 'fechado' || p.estado === 'resolvido' || p.estado === 'concluido')

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addPedido(form)
      showToast('Pedido criado com sucesso')
      setShowAdd(false)
      setForm(EMPTY)
    } catch (err) {
      showToast(err.message || 'Erro ao criar pedido', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleAccept(pedido) {
    try {
      await updatePedido(pedido.id, { estado: 'aceite' })
      showToast('Pedido aceite')
    } catch (err) {
      showToast('Erro ao actualizar pedido', 'error')
    }
  }

  async function handleClose(pedido) {
    try {
      await updatePedido(pedido.id, { estado: 'fechado' })
      showToast('Pedido fechado')
    } catch (err) {
      showToast('Erro ao fechar pedido', 'error')
    }
  }

  async function generateEmail(pedido) {
    setAiLoading(true)
    setShowEmail(pedido)
    const fallback = `Assunto: Pedido de Manutenção — ${pedido.matricula || 'Viatura'}\n\nExmo(a) Sr(a),\n\nVimos por este meio solicitar intervenção de manutenção para a viatura ${pedido.matricula || ''}.\n\nDescrição: ${pedido.descricao}\n\nUrgência: ${pedido.urgencia}\n\nAguardamos contacto.\n\nCom os melhores cumprimentos,\nCentro Social da Paróquia da Areosa`
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'x-api-key': '' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          messages: [{
            role: 'user',
            content: `Gera um email profissional em português europeu para solicitar manutenção a uma oficina. Pedido: "${pedido.titulo}". Viatura: ${pedido.matricula || 'não especificada'}. Descrição: ${pedido.descricao}. Urgência: ${pedido.urgencia}. Assinado por: Centro Social da Paróquia da Areosa, Porto. Apenas o email, sem texto extra.`,
          }],
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setEmailContent(data.content[0].text)
      } else {
        setEmailContent(fallback)
      }
    } catch {
      setEmailContent(fallback)
    } finally {
      setAiLoading(false)
    }
  }

  function statusBadge(estado) {
    const map = {
      pendente: { variant: 'warning', label: 'Pendente' },
      aberto: { variant: 'warning', label: 'Aberto' },
      aceite: { variant: 'info', label: 'Aceite' },
      fechado: { variant: 'gray', label: 'Fechado' },
      resolvido: { variant: 'ok', label: 'Resolvido' },
      concluido: { variant: 'ok', label: 'Concluído' },
    }
    const c = map[estado] || { variant: 'gray', label: estado }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  function PedidoCard({ p }) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 shadow-sm border-l-4 overflow-hidden ${URGENCY_COLOR[p.urgencia] || ''}`}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 text-sm">{p.titulo}</h3>
                <Badge variant={URGENCY_BADGE[p.urgencia] || 'gray'}>
                  {p.urgencia === 'alta' ? 'Alta' : p.urgencia === 'media' ? 'Média' : 'Baixa'}
                </Badge>
                {statusBadge(p.estado)}
              </div>
              {p.matricula && (
                <span className="font-mono text-xs text-slate-500">{p.matricula}</span>
              )}
              <p className="text-sm text-slate-600 mt-1.5">{p.descricao}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>{formatDate(p.data || p.created_at)}</span>
                {p.solicitante && <span>• {p.solicitante}</span>}
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            {(p.estado === 'pendente' || p.estado === 'aberto') && (
              <button
                onClick={() => handleAccept(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle size={13} />
                Aceitar
              </button>
            )}
            {p.estado !== 'fechado' && p.estado !== 'resolvido' && p.estado !== 'concluido' && (
              <button
                onClick={() => handleClose(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XCircle size={13} />
                Fechar
              </button>
            )}
            <button
              onClick={() => generateEmail(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Mail size={13} />
              Gerar email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pedidos de manutenção</h1>
          <p className="text-sm text-slate-500">{pending.length} pendente(s) · {pedidos.length} total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo pedido
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 text-slate-400">
          <ClipboardList size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Nenhum pedido registado</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Clock size={14} className="text-amber-500" />
                Pendentes ({pending.length})
              </h2>
              <div className="grid gap-3">
                {pending.map((p) => <PedidoCard key={p.id} p={p} />)}
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                Histórico ({resolved.length})
              </h2>
              <div className="grid gap-3 opacity-70">
                {resolved.map((p) => <PedidoCard key={p.id} p={p} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Novo pedido de manutenção" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input name="titulo" value={form.titulo} onChange={handleFormChange} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Viatura</label>
              <select name="matricula" value={form.matricula} onChange={handleFormChange} className="input-field">
                <option value="">Nenhuma</option>
                {frota.map((v) => (
                  <option key={v.id} value={v.matricula}>{v.matricula} — {v.marca} {v.modelo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Urgência</label>
              <select name="urgencia" value={form.urgencia} onChange={handleFormChange} className="input-field">
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input name="data" value={form.data} onChange={handleFormChange} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Solicitante</label>
              <input name="solicitante" value={form.solicitante} onChange={handleFormChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
            <textarea name="descricao" value={form.descricao} onChange={handleFormChange} className="input-field resize-none" rows={3} required />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'A guardar...' : 'Criar pedido'}</button>
          </div>
        </form>
      </Modal>

      {/* Email modal */}
      <Modal open={!!showEmail} onClose={() => { setShowEmail(null); setEmailContent('') }} title="Email gerado por IA" size="xl">
        <div className="space-y-4">
          {aiLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 size={20} className="animate-spin text-[#2d6a4f]" />
              <span className="text-sm">A gerar email...</span>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{emailContent}</pre>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(emailContent).then(() => showToast('Copiado!'))}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <Copy size={14} />
                  Copiar
                </button>
                <button onClick={() => { setShowEmail(null); setEmailContent('') }} className="flex-1 btn-primary">Fechar</button>
              </div>
            </>
          )}
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
