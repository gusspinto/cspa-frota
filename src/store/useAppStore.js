import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { daysUntil, todayISO } from '../lib/utils'

function computeAlerts(frota, condutores = []) {
  const alerts = []
  const today = todayISO()

  for (const v of frota) {
    // Km since last revision
    if (v.km_proxima_revisao != null && v.km_atual != null) {
      const remaining = v.km_proxima_revisao - v.km_atual
      if (remaining <= 0) {
        alerts.push({
          id: `km-critical-${v.id}`,
          type: 'km',
          severity: 'critical',
          viatura: v.matricula,
          message: `${v.matricula} — Revisão ultrapassada em ${Math.abs(remaining).toLocaleString('pt-PT')} km`,
          model: v.modelo,
        })
      } else if (remaining <= 1500) {
        alerts.push({
          id: `km-warn-${v.id}`,
          type: 'km',
          severity: 'warning',
          viatura: v.matricula,
          message: `${v.matricula} — Revisão em ${remaining.toLocaleString('pt-PT')} km`,
          model: v.modelo,
        })
      }
    }

    // Insurance expiry
    if (v.seguro_validade) {
      const days = daysUntil(v.seguro_validade)
      if (days != null) {
        if (days <= 0) {
          alerts.push({
            id: `seg-critical-${v.id}`,
            type: 'seguro',
            severity: 'critical',
            viatura: v.matricula,
            message: `${v.matricula} — Seguro expirado há ${Math.abs(days)} dia(s)`,
            model: v.modelo,
            date: v.seguro_validade,
          })
        } else if (days <= 30) {
          alerts.push({
            id: `seg-warn-${v.id}`,
            type: 'seguro',
            severity: 'warning',
            viatura: v.matricula,
            message: `${v.matricula} — Seguro expira em ${days} dia(s)`,
            model: v.modelo,
            date: v.seguro_validade,
          })
        }
      }
    }

    // Inspection expiry
    if (v.inspecao_validade) {
      const days = daysUntil(v.inspecao_validade)
      if (days != null) {
        if (days <= 0) {
          alerts.push({
            id: `ins-critical-${v.id}`,
            type: 'inspecao',
            severity: 'critical',
            viatura: v.matricula,
            message: `${v.matricula} — Inspeção expirada há ${Math.abs(days)} dia(s)`,
            model: v.modelo,
            date: v.inspecao_validade,
          })
        } else if (days <= 45) {
          alerts.push({
            id: `ins-warn-${v.id}`,
            type: 'inspecao',
            severity: 'warning',
            viatura: v.matricula,
            message: `${v.matricula} — Inspeção expira em ${days} dia(s)`,
            model: v.modelo,
            date: v.inspecao_validade,
          })
        }
      }
    }
  }

  // Driver license expiry
  for (const c of condutores) {
    if (c.carta_validade) {
      const days = daysUntil(c.carta_validade)
      if (days != null) {
        if (days <= 0) {
          alerts.push({
            id: `lic-critical-${c.id}`,
            type: 'carta',
            severity: 'critical',
            viatura: null,
            condutor: c.nome,
            message: `${c.nome} — Carta de condução expirada há ${Math.abs(days)} dia(s)`,
            date: c.carta_validade,
          })
        } else if (days <= 60) {
          alerts.push({
            id: `lic-warn-${c.id}`,
            type: 'carta',
            severity: 'warning',
            viatura: null,
            condutor: c.nome,
            message: `${c.nome} — Carta de condução expira em ${days} dia(s)`,
            date: c.carta_validade,
          })
        }
      }
    }
  }

  return alerts
}

const useAppStore = create((set, get) => ({
  frota: [],
  manutencoes: [],
  pedidos: [],
  abastecimentos: [],
  viagens: [],
  condutores: [],
  currentUser: null,
  isDark: localStorage.getItem('csa_dark') === 'true',
  alerts: [],
  dbMissing: [],
  loading: false,
  toast: null,

  setUser: (user) => set({ currentUser: user }),

  toggleDark: () => {
    const next = !get().isDark
    localStorage.setItem('csa_dark', String(next))
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    set({ isDark: next })
  },

  showToast: (message, type = 'success') => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => set({ toast: null }), 3500)
  },

  loadAll: async () => {
    set({ loading: true })
    const dbMissing = []

    // Load frota
    const { data: frota } = await supabase.from('viaturas').select('*').order('matricula')

    // Load manutencoes
    const { data: manutencoes } = await supabase.from('manutencoes').select('*').order('data', { ascending: false })

    // Load pedidos
    const { data: pedidos } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false })

    // Load abastecimentos (may not exist)
    let abastecimentos = []
    try {
      const { data, error } = await supabase.from('abastecimentos').select('*').order('data', { ascending: false })
      if (error) {
        if (error.code === '42P01') dbMissing.push('abastecimentos')
        else abastecimentos = []
      } else {
        abastecimentos = data || []
      }
    } catch {
      dbMissing.push('abastecimentos')
    }

    // Load viagens (may not exist)
    let viagens = []
    try {
      const { data, error } = await supabase.from('viagens').select('*').order('data', { ascending: false })
      if (error) {
        if (error.code === '42P01') dbMissing.push('viagens')
        else viagens = []
      } else {
        viagens = data || []
      }
    } catch {
      dbMissing.push('viagens')
    }

    // Load condutores (may not exist)
    let condutores = []
    try {
      const { data, error } = await supabase.from('condutores').select('*').order('nome')
      if (error) {
        if (error.code === '42P01') dbMissing.push('condutores')
        else condutores = []
      } else {
        condutores = data || []
      }
    } catch {
      dbMissing.push('condutores')
    }

    const alerts = computeAlerts(frota || [], condutores)

    set({
      frota: frota || [],
      manutencoes: manutencoes || [],
      pedidos: pedidos || [],
      abastecimentos,
      viagens,
      condutores,
      alerts,
      dbMissing,
      loading: false,
    })
  },

  refreshAlerts: () => {
    const { frota, condutores } = get()
    set({ alerts: computeAlerts(frota, condutores) })
  },

  // Frota actions
  addViatura: async (data) => {
    const { error, data: inserted } = await supabase.from('viaturas').insert([data]).select().single()
    if (error) throw error
    set((s) => {
      const frota = [...s.frota, inserted]
      return { frota, alerts: computeAlerts(frota, s.condutores) }
    })
    return inserted
  },

  updateViatura: async (id, data) => {
    const { error, data: updated } = await supabase.from('viaturas').update(data).eq('id', id).select().single()
    if (error) throw error
    set((s) => {
      const frota = s.frota.map((v) => (v.id === id ? updated : v))
      return { frota, alerts: computeAlerts(frota, s.condutores) }
    })
    return updated
  },

  deleteViatura: async (id) => {
    const { error } = await supabase.from('viaturas').delete().eq('id', id)
    if (error) throw error
    set((s) => {
      const frota = s.frota.filter((v) => v.id !== id)
      return { frota, alerts: computeAlerts(frota, s.condutores) }
    })
  },

  // Manutencoes actions
  addManutencao: async (data) => {
    const { error, data: inserted } = await supabase.from('manutencoes').insert([data]).select().single()
    if (error) throw error
    set((s) => ({ manutencoes: [inserted, ...s.manutencoes] }))
    return inserted
  },

  deleteManutencao: async (id) => {
    const { error } = await supabase.from('manutencoes').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ manutencoes: s.manutencoes.filter((m) => m.id !== id) }))
  },

  // Pedidos actions
  addPedido: async (data) => {
    const { error, data: inserted } = await supabase.from('pedidos').insert([data]).select().single()
    if (error) throw error
    set((s) => ({ pedidos: [inserted, ...s.pedidos] }))
    return inserted
  },

  updatePedido: async (id, data) => {
    const { error, data: updated } = await supabase.from('pedidos').update(data).eq('id', id).select().single()
    if (error) throw error
    set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id ? updated : p)) }))
    return updated
  },

  deletePedido: async (id) => {
    const { error } = await supabase.from('pedidos').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ pedidos: s.pedidos.filter((p) => p.id !== id) }))
  },

  // Abastecimentos actions
  addAbastecimento: async (data) => {
    const { error, data: inserted } = await supabase.from('abastecimentos').insert([data]).select().single()
    if (error) throw error
    set((s) => ({ abastecimentos: [inserted, ...s.abastecimentos] }))
    return inserted
  },

  deleteAbastecimento: async (id) => {
    const { error } = await supabase.from('abastecimentos').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ abastecimentos: s.abastecimentos.filter((a) => a.id !== id) }))
  },

  // Viagens actions
  addViagem: async (data) => {
    const { error, data: inserted } = await supabase.from('viagens').insert([data]).select().single()
    if (error) throw error
    set((s) => ({ viagens: [inserted, ...s.viagens] }))
    return inserted
  },

  deleteViagem: async (id) => {
    const { error } = await supabase.from('viagens').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ viagens: s.viagens.filter((v) => v.id !== id) }))
  },

  // Condutores actions
  addCondutor: async (data) => {
    const { error, data: inserted } = await supabase.from('condutores').insert([data]).select().single()
    if (error) throw error
    set((s) => {
      const condutores = [...s.condutores, inserted].sort((a, b) => a.nome.localeCompare(b.nome))
      return { condutores, alerts: computeAlerts(s.frota, condutores) }
    })
    return inserted
  },

  updateCondutor: async (id, data) => {
    const { error, data: updated } = await supabase.from('condutores').update(data).eq('id', id).select().single()
    if (error) throw error
    set((s) => {
      const condutores = s.condutores.map((c) => (c.id === id ? updated : c))
      return { condutores, alerts: computeAlerts(s.frota, condutores) }
    })
    return updated
  },

  deleteCondutor: async (id) => {
    const { error } = await supabase.from('condutores').delete().eq('id', id)
    if (error) throw error
    set((s) => {
      const condutores = s.condutores.filter((c) => c.id !== id)
      return { condutores, alerts: computeAlerts(s.frota, condutores) }
    })
  },
}))

export default useAppStore
