import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import useAppStore from './store/useAppStore'
import Layout from './components/Layout'
import Toast from './components/ui/Toast'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Frota from './pages/Frota'
import Alertas from './pages/Alertas'
import Manutencoes from './pages/Manutencoes'
import Pedidos from './pages/Pedidos'
import Combustivel from './pages/Combustivel'
import Viagens from './pages/Viagens'
import Condutores from './pages/Condutores'
import Config from './pages/Config'

function ProtectedRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading
  const { setUser: storeSetUser, loadAll, toast } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      storeSetUser(u)
      if (u) loadAll()
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      storeSetUser(u)
      if (u) {
        loadAll()
      } else {
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">A carregar...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user}>
              <Layout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="frota" element={<Frota />} />
                  <Route path="alertas" element={<Alertas />} />
                  <Route path="manutencoes" element={<Manutencoes />} />
                  <Route path="pedidos" element={<Pedidos />} />
                  <Route path="combustivel" element={<Combustivel />} />
                  <Route path="viagens" element={<Viagens />} />
                  <Route path="condutores" element={<Condutores />} />
                  <Route path="config" element={<Config />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}
