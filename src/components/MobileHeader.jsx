import { useState } from 'react'
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import Sidebar from './Sidebar'

export default function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isDark, toggleDark } = useAppStore()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:hidden shrink-0">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="https://www.centrosocialareosa.pt/uploads/7/2/4/0/7240418/published/1453202777.png"
            alt="Logo"
            className="h-7 w-7 object-contain"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="text-sm font-semibold text-slate-900">CSA Areosa</span>
        </div>
        <button onClick={toggleDark} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 flex">
            <Sidebar onClose={() => setDrawerOpen(false)} />
            <button
              className="ml-2 mt-2 p-2 bg-white rounded-lg shadow text-slate-600 self-start"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
