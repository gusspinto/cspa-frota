import { useState } from 'react'
import { Settings, Database, Mail, UserPlus, Download, Copy, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/utils'

const MIGRATION_SQL = `-- Migração CSA Frota — Execute no SQL Editor do Supabase

-- Tabela: abastecimentos
CREATE TABLE IF NOT EXISTS abastecimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula TEXT,
  data DATE NOT NULL,
  litros NUMERIC(8,2),
  custo_total NUMERIC(10,2),
  km_no_abastecimento INTEGER,
  posto TEXT,
  tipo_combustivel TEXT DEFAULT 'gasóleo',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: viagens
CREATE TABLE IF NOT EXISTS viagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula TEXT,
  data DATE NOT NULL,
  km_inicio INTEGER,
  km_fim INTEGER,
  km INTEGER GENERATED ALWAYS AS (km_fim - km_inicio) STORED,
  destino TEXT,
  condutor TEXT,
  motivo TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: condutores
CREATE TABLE IF NOT EXISTS condutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  numero_carta TEXT,
  carta_validade DATE,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (opcional — ajuste as políticas conforme necessário)
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE condutores ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso autenticado
CREATE POLICY "auth_all_abastecimentos" ON abastecimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_viagens" ON viagens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_condutores" ON condutores FOR ALL TO authenticated USING (true) WITH CHECK (true);`

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <Icon size={16} className="text-[#2d6a4f]" />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Config() {
  const { frota, manutencoes, pedidos, abastecimentos, viagens, condutores, dbMissing, showToast } = useAppStore()

  const [emailConfig, setEmailConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('csa_emailjs') || '{}')
    } catch {
      return {}
    }
  })
  const [newUser, setNewUser] = useState({ email: '', password: '' })
  const [creatingUser, setCreatingUser] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)

  function handleEmailChange(e) {
    const next = { ...emailConfig, [e.target.name]: e.target.value }
    setEmailConfig(next)
    localStorage.setItem('csa_emailjs', JSON.stringify(next))
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const { error } = await supabase.auth.admin?.createUser?.({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      }) || await supabase.auth.signUp({ email: newUser.email, password: newUser.password })
      if (error) throw error
      showToast('Utilizador criado com sucesso')
      setNewUser({ email: '', password: '' })
    } catch (err) {
      showToast(err.message || 'Erro ao criar utilizador', 'error')
    } finally {
      setCreatingUser(false)
    }
  }

  function copySQL() {
    navigator.clipboard.writeText(MIGRATION_SQL)
      .then(() => {
        setSqlCopied(true)
        showToast('SQL copiado para a área de transferência')
        setTimeout(() => setSqlCopied(false), 2000)
      })
      .catch(() => showToast('Erro ao copiar', 'error'))
  }

  function exportCSV(name, data) {
    if (!data || data.length === 0) {
      showToast('Sem dados para exportar', 'warning')
      return
    }
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map((row) =>
      Object.values(row).map((v) => (v == null ? '' : `"${String(v).replace(/"/g, '""')}"`)).join(',')
    ).join('\n')
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `csa-frota-${name}-${todayISO()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tables = [
    { key: 'viaturas', label: 'viaturas', count: frota.length, missing: false },
    { key: 'manutencoes', label: 'manutencoes', count: manutencoes.length, missing: false },
    { key: 'pedidos', label: 'pedidos', count: pedidos.length, missing: false },
    { key: 'abastecimentos', label: 'abastecimentos', count: abastecimentos.length, missing: dbMissing.includes('abastecimentos') },
    { key: 'viagens', label: 'viagens', count: viagens.length, missing: dbMissing.includes('viagens') },
    { key: 'condutores', label: 'condutores', count: condutores.length, missing: dbMissing.includes('condutores') },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">Gestão do sistema e base de dados</p>
      </div>

      {/* Supabase status */}
      <Section title="Estado da base de dados" icon={Database}>
        <div className="space-y-2">
          {tables.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                {t.missing ? (
                  <XCircle size={14} className="text-red-500" />
                ) : (
                  <CheckCircle size={14} className="text-emerald-500" />
                )}
                <code className="font-mono text-sm text-slate-700">{t.label}</code>
              </div>
              <div className="flex items-center gap-3">
                {t.missing ? (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    Tabela em falta
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">{t.count} registo(s)</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {dbMissing.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              {dbMissing.length} tabela(s) em falta. Execute a migração SQL abaixo para as criar.
            </p>
          </div>
        )}
      </Section>

      {/* Migração SQL */}
      <Section title="Migração SQL" icon={Database}>
        <p className="text-sm text-slate-600 mb-4">
          Copie e execute este SQL no <strong>SQL Editor</strong> do Supabase para criar as tabelas necessárias.
        </p>
        <div className="relative">
          <pre className="font-mono text-xs text-slate-700 bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto max-h-64 leading-relaxed">
            {MIGRATION_SQL}
          </pre>
          <button
            onClick={copySQL}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {sqlCopied ? <CheckCircle size={12} /> : <Copy size={12} />}
            {sqlCopied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </Section>

      {/* Export CSV */}
      <Section title="Exportar dados (CSV)" icon={Download}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Viaturas', data: frota, name: 'viaturas' },
            { label: 'Manutenções', data: manutencoes, name: 'manutencoes' },
            { label: 'Pedidos', data: pedidos, name: 'pedidos' },
            { label: 'Abastecimentos', data: abastecimentos, name: 'abastecimentos' },
            { label: 'Viagens', data: viagens, name: 'viagens' },
            { label: 'Condutores', data: condutores, name: 'condutores' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => exportCSV(item.name, item.data)}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors text-left"
            >
              <Download size={14} className="text-slate-500 shrink-0" />
              <div>
                <div className="text-sm">{item.label}</div>
                <div className="text-xs text-slate-400">{item.data.length} reg.</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* EmailJS config */}
      <Section title="Configuração EmailJS" icon={Mail}>
        <p className="text-sm text-slate-600 mb-4">
          Configuração para envio de emails via EmailJS. As configurações são guardadas localmente no browser.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'service_id', label: 'Service ID' },
            { name: 'template_id', label: 'Template ID' },
            { name: 'public_key', label: 'Public Key' },
            { name: 'to_email', label: 'Email destino' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
              <input
                name={field.name}
                value={emailConfig[field.name] || ''}
                onChange={handleEmailChange}
                className="input-field font-mono"
                placeholder={field.name}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">As configurações são guardadas automaticamente no localStorage do browser.</p>
      </Section>

      {/* Create user */}
      <Section title="Criar utilizador" icon={UserPlus}>
        <p className="text-sm text-slate-600 mb-4">
          Crie um novo utilizador com acesso ao sistema. Recomenda-se usar o painel de administração do Supabase para maior controlo.
        </p>
        <form onSubmit={handleCreateUser} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
              className="input-field"
              placeholder="utilizador@csareosa.pt"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Palavra-passe</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
              className="input-field"
              placeholder="mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
          <button type="submit" disabled={creatingUser} className="btn-primary flex items-center gap-2">
            {creatingUser ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {creatingUser ? 'A criar...' : 'Criar utilizador'}
          </button>
        </form>
      </Section>

      <style>{`
        .input-field { width:100%;padding:.5rem .75rem;font-size:.875rem;border:1px solid #e2e8f0;border-radius:.5rem;outline:none;transition:box-shadow .15s;background:white;color:#0f172a; }
        .input-field:focus { box-shadow:0 0 0 2px #2d6a4f40;border-color:#2d6a4f; }
        .btn-primary { padding:.5rem 1rem;background:#2d6a4f;color:white;font-size:.875rem;font-weight:600;border-radius:.5rem;border:none;cursor:pointer;transition:background .15s;display:inline-flex;align-items:center; }
        .btn-primary:hover { background:#1b4332; }
        .btn-primary:disabled { opacity:.6;cursor:not-allowed; }
      `}</style>
    </div>
  )
}
